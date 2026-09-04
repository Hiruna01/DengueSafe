using HackathonApi.Dtos;

namespace HackathonApi.Services;

public interface IOfficerService
{
    Task<PagedResult<OfficerDto>> GetAllAsync(
        OfficerQueryParameters query,
        CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.BadRequestException">The email is already in use.</exception>
    Task<OfficerDto> CreateAsync(
        CreateOfficerDto dto,
        int createdById,
        CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No officer with that id exists.</exception>
    /// <exception cref="Middleware.BadRequestException">
    /// The change would demote the last active Admin.
    /// </exception>
    Task<OfficerDto> UpdateAsync(
        int id,
        UpdateOfficerDto dto,
        CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No officer with that id exists.</exception>
    /// <exception cref="Middleware.BadRequestException">
    /// The officer is deactivating themselves, or the change would remove the
    /// last active Admin.
    /// </exception>
    Task<OfficerDto> SetActiveAsync(
        int id,
        bool isActive,
        int actingOfficerId,
        CancellationToken cancellationToken = default);
}
