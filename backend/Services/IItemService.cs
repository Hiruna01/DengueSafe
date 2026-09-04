using HackathonApi.Dtos;

namespace HackathonApi.Services;

public interface IItemService
{
    Task<PagedResult<ItemDto>> GetAsync(ItemQueryParameters query, CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No item with that id exists.</exception>
    Task<ItemDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ItemDto> CreateAsync(CreateItemDto dto, CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No item with that id exists.</exception>
    Task<ItemDto> UpdateAsync(int id, UpdateItemDto dto, CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No item with that id exists.</exception>
    Task<ItemDto> UpdateStatusAsync(int id, UpdateItemStatusDto dto, CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No item with that id exists.</exception>
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
