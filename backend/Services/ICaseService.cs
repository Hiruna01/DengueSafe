using HackathonApi.Dtos;

namespace HackathonApi.Services;

public interface ICaseService
{
    Task<PagedResult<CaseDto>> GetCasesAsync(
        CaseQueryParameters query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Records a case and opens the premises-inspection report that goes with
    /// it, in a single transaction.
    /// </summary>
    /// <exception cref="Middleware.NotFoundException">No division with that id exists.</exception>
    Task<CaseDto> CreateAsync(CreateCaseDto dto, CancellationToken cancellationToken = default);
}
