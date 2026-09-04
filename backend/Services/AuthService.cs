using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HackathonApi.Data;
using HackathonApi.Dtos;
using HackathonApi.Middleware;
using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HackathonApi.Services;

public class AuthService : IAuthService
{
    /*
      Deliberately the same message for an unknown email and a wrong password.
      Distinguishing them would turn the login endpoint into a way of asking
      which addresses hold accounts here, which is worth more to an attacker
      than it is to a user who mistyped.
    */
    private const string InvalidCredentials = "Invalid email or password.";

    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(
        LoginDto dto,
        CancellationToken cancellationToken = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        var officer = await _db.Officers
            .AsNoTracking()
            .Include(o => o.CreatedBy)
            .FirstOrDefaultAsync(o => o.Email == email, cancellationToken);

        // Verify against a real hash even when the account is missing, so a
        // failed lookup takes about as long as a failed password and the
        // response time does not become the answer we refused to give above.
        var hash = officer?.PasswordHash ?? BCrypt.Net.BCrypt.HashPassword("no-such-account");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, hash) || officer is null)
        {
            throw new BadRequestException(InvalidCredentials);
        }

        // Said plainly, unlike the credentials message: the account exists and
        // the password was right, so there is nothing left to conceal and the
        // officer needs to know who to ask.
        if (!officer.IsActive)
        {
            throw new BadRequestException(
                "This account has been deactivated. Contact an administrator to have it restored.");
        }

        var issuedAt = DateTime.UtcNow;
        var expiresAt = issuedAt.Add(JwtSettings.Lifetime);

        return new AuthResponseDto(BuildToken(officer, issuedAt, expiresAt), ToDto(officer), expiresAt);
    }

    public async Task<OfficerDto> GetCurrentAsync(
        int officerId,
        CancellationToken cancellationToken = default)
    {
        var officer = await _db.Officers
            .AsNoTracking()
            .Include(o => o.CreatedBy)
            .FirstOrDefaultAsync(o => o.Id == officerId, cancellationToken)
            ?? throw new NotFoundException("Officer", officerId);

        // A token outlives a deactivation, so the account is re-checked here
        // rather than trusted because it was valid when the token was signed.
        if (!officer.IsActive)
        {
            throw new BadRequestException("This account has been deactivated.");
        }

        return ToDto(officer);
    }

    private string BuildToken(Officer officer, DateTime issuedAt, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(JwtSettings.ResolveSigningKey(_configuration)));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, officer.Id.ToString()),
            new(ClaimTypes.Name, officer.FullName),
            new(ClaimTypes.Email, officer.Email),
            new(ClaimTypes.Role, officer.Role.ToString()),
            new(JwtSettings.MohAreaClaim, officer.MohArea)
        };

        var token = new JwtSecurityToken(
            issuer: JwtSettings.Issuer,
            audience: JwtSettings.Audience,
            claims: claims,
            notBefore: issuedAt,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    internal static OfficerDto ToDto(Officer officer) => new(
        officer.Id,
        officer.FullName,
        officer.Email,
        officer.MohArea,
        officer.Role,
        officer.IsActive,
        officer.CreatedAt,
        officer.CreatedBy?.FullName);
}
