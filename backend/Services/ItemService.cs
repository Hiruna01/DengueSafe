using HackathonApi.Data;
using HackathonApi.Dtos;
using HackathonApi.Middleware;
using HackathonApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HackathonApi.Services;

public class ItemService : IItemService
{
    private const int MaxPageSize = 100;

    /// <summary>
    /// Sort fields a client may name, mapped to the expression EF translates.
    /// Anything outside this set falls back to CreatedAt rather than being
    /// interpolated into the query.
    /// </summary>
    private static readonly Dictionary<string, System.Linq.Expressions.Expression<Func<Item, object?>>> SortFields =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Id"] = i => i.Id,
            ["Title"] = i => i.Title,
            ["Category"] = i => i.Category,
            ["Status"] = i => i.Status,
            ["Priority"] = i => i.Priority,
            ["CreatedAt"] = i => i.CreatedAt,
            ["UpdatedAt"] = i => i.UpdatedAt
        };

    private readonly AppDbContext _db;

    public ItemService(AppDbContext db) => _db = db;

    public async Task<PagedResult<ItemDto>> GetAsync(
        ItemQueryParameters query,
        CancellationToken cancellationToken = default)
    {
        var items = _db.Items.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            // ILIKE keeps the match case-insensitive in Postgres itself.
            var pattern = $"%{Escape(query.Search.Trim())}%";
            items = items.Where(i =>
                EF.Functions.ILike(i.Title, pattern, "\\") ||
                EF.Functions.ILike(i.Description, pattern, "\\"));
        }

        if (query.Status is not null)
        {
            items = items.Where(i => i.Status == query.Status);
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            var category = query.Category.Trim();
            items = items.Where(i => EF.Functions.ILike(i.Category, Escape(category), "\\"));
        }

        var totalCount = await items.CountAsync(cancellationToken);

        var sortField = SortFields.TryGetValue(query.SortBy ?? string.Empty, out var expression)
            ? expression
            : SortFields["CreatedAt"];

        items = query.SortDescending
            ? items.OrderByDescending(sortField).ThenByDescending(i => i.Id)
            : items.OrderBy(sortField).ThenBy(i => i.Id);

        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = Math.Clamp(query.PageSize < 1 ? 10 : query.PageSize, 1, MaxPageSize);

        var results = await items
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new ItemDto(
                i.Id, i.Title, i.Description, i.Category, i.Status, i.Priority, i.CreatedAt, i.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<ItemDto>(results, totalCount, page, pageSize);
    }

    public async Task<ItemDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _db.Items
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (item is null)
        {
            throw new NotFoundException("Item", id);
        }

        return ToDto(item);
    }

    public async Task<ItemDto> CreateAsync(CreateItemDto dto, CancellationToken cancellationToken = default)
    {
        var item = new Item
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            Category = dto.Category.Trim(),
            Status = dto.Status,
            Priority = dto.Priority,
            CreatedAt = DateTime.UtcNow
        };

        _db.Items.Add(item);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(item);
    }

    public async Task<ItemDto> UpdateAsync(int id, UpdateItemDto dto, CancellationToken cancellationToken = default)
    {
        var item = await FindOrThrowAsync(id, cancellationToken);

        item.Title = dto.Title.Trim();
        item.Description = dto.Description?.Trim() ?? string.Empty;
        item.Category = dto.Category.Trim();
        item.Status = dto.Status;
        item.Priority = dto.Priority;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(item);
    }

    public async Task<ItemDto> UpdateStatusAsync(
        int id,
        UpdateItemStatusDto dto,
        CancellationToken cancellationToken = default)
    {
        var item = await FindOrThrowAsync(id, cancellationToken);

        item.Status = dto.Status;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(item);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await FindOrThrowAsync(id, cancellationToken);

        _db.Items.Remove(item);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<Item> FindOrThrowAsync(int id, CancellationToken cancellationToken)
        => await _db.Items.FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
           ?? throw new NotFoundException("Item", id);

    private static ItemDto ToDto(Item item) => new(
        item.Id,
        item.Title,
        item.Description,
        item.Category,
        item.Status,
        item.Priority,
        item.CreatedAt,
        item.UpdatedAt);

    /// <summary>Neutralises LIKE wildcards so a user's % or _ matches literally.</summary>
    private static string Escape(string value) => value
        .Replace("\\", "\\\\")
        .Replace("%", "\\%")
        .Replace("_", "\\_");
}
