using HackathonApi.Dtos;

namespace HackathonApi.Services;

public interface IReportService
{
    /// <summary>
    /// Filtered, paged reports ordered by risk score descending — the queue an
    /// inspector should work top-down, rather than newest-first.
    /// </summary>
    Task<PagedResult<ReportDto>> GetReportsAsync(
        ReportQueryParameters query,
        CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No report with that id exists.</exception>
    Task<ReportDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No division with that id exists.</exception>
    Task<ReportDto> CreateAsync(CreateReportDto dto, CancellationToken cancellationToken = default);

    /// <exception cref="Middleware.NotFoundException">No report with that id exists.</exception>
    Task<ReportDto> UpdateStatusAsync(
        int id,
        UpdateReportStatusDto dto,
        CancellationToken cancellationToken = default);
}
