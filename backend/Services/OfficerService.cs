using HackathonApi.Data;
using HackathonApi.Dtos;
using HackathonApi.Middleware;
using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonApi.Services;

public class OfficerService : IOfficerService
{
    private const int MaxPageSize = 100;

    private readonly AppDbContext _db;

    public OfficerService(AppDbContext db) => _db = db;

    public async Task<PagedResult<OfficerDto>> GetAllAsync(
        OfficerQueryParameters query,
        CancellationToken cancellationToken = default)
    {
        var officers = _db.Officers
            .AsNoTracking()
            .Include(o => o.CreatedBy)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{Escape(query.Search.Trim())}%";
            officers = officers.Where(o =>
                EF.Functions.ILike(o.FullName, pattern, "\\") ||
                EF.Functions.ILike(o.Email, pattern, "\\"));
        }

        if (query.Role is not null)
        {
            officers = officers.Where(o => o.Role == query.Role);
        }

        if (query.IsActive is not null)
        {
            officers = officers.Where(o => o.IsActive == query.IsActive);
        }

        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = Math.Clamp(query.PageSize < 1 ? 10 : query.PageSize, 1, MaxPageSize);

        var totalCount = await officers.CountAsync(cancellationToken);

        var results = await officers
            .OrderBy(o => o.FullName)
            .ThenBy(o => o.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<OfficerDto>(
            results.Select(AuthService.ToDto).ToList(),
            totalCount,
            page,
            pageSize);
    }

    public async Task<OfficerDto> CreateAsync(
        CreateOfficerDto dto,
        int createdById,
        CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        // Checked up front so a duplicate comes back as a readable 400 rather
        // than a unique-index violation from Postgres. The index is still what
        // guarantees it under a race.
        if (await _db.Officers.AnyAsync(o => o.Email == email, cancellationToken))
        {
            throw new BadRequestException($"An account already exists for {email}.");
        }

        var officer = new Officer
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            MohArea = dto.MohArea.Trim(),
            Role = dto.Role!.Value,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedById = createdById
        };

        _db.Officers.Add(officer);
        await _db.SaveChangesAsync(cancellationToken);

        officer.CreatedBy = await _db.Officers
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == createdById, cancellationToken);

        return AuthService.ToDto(officer);
    }

    public async Task<OfficerDto> UpdateAsync(
        int id,
        UpdateOfficerDto dto,
        CancellationToken cancellationToken = default)
    {
        var officer = await _db.Officers
            .Include(o => o.CreatedBy)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken)
            ?? throw new NotFoundException("Officer", id);

        if (dto.FullName is not null)
        {
            officer.FullName = dto.FullName.Trim();
        }

        if (dto.MohArea is not null)
        {
            officer.MohArea = dto.MohArea.Trim();
        }

        if (dto.Role is not null && dto.Role != officer.Role)
        {
            // Demoting an Admin removes an Admin just as surely as deactivating
            // one does, so the same floor applies.
            if (officer.Role == OfficerRole.Admin)
            {
                await GuardLastActiveAdminAsync(officer, cancellationToken);
            }

            officer.Role = dto.Role.Value;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return AuthService.ToDto(officer);
    }

    public async Task<OfficerDto> SetActiveAsync(
        int id,
        bool isActive,
        int actingOfficerId,
        CancellationToken cancellationToken = default)
    {
        var officer = await _db.Officers
            .Include(o => o.CreatedBy)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken)
            ?? throw new NotFoundException("Officer", id);

        // Locking yourself out is never the intent, and recovering from it
        // needs another Admin.
        if (!isActive && id == actingOfficerId)
        {
            throw new BadRequestException("You cannot deactivate your own account.");
        }

        if (!isActive && officer.IsActive && officer.Role == OfficerRole.Admin)
        {
            await GuardLastActiveAdminAsync(officer, cancellationToken);
        }

        officer.IsActive = isActive;

        await _db.SaveChangesAsync(cancellationToken);

        return AuthService.ToDto(officer);
    }

    /// <summary>
    /// Refuses a change that would leave no active Admin at all — which would
    /// lock every remaining account out of officer management permanently,
    /// since only an Admin can restore one.
    /// </summary>
    private async Task GuardLastActiveAdminAsync(Officer officer, CancellationToken cancellationToken)
    {
        var otherActiveAdmins = await _db.Officers
            .CountAsync(
                o => o.Id != officer.Id && o.Role == OfficerRole.Admin && o.IsActive,
                cancellationToken);

        if (otherActiveAdmins == 0)
        {
            throw new BadRequestException(
                "This is the last active administrator. Promote or activate another administrator first.");
        }
    }

    /// <summary>Neutralises LIKE wildcards so a user's % or _ matches literally.</summary>
    private static string Escape(string value) => value
        .Replace("\\", "\\\\")
        .Replace("%", "\\%")
        .Replace("_", "\\_");
}
