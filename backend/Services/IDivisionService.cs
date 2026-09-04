using HackathonApi.Dtos;

namespace HackathonApi.Services;

public interface IDivisionService
{
    /// <summary>Every division, scored and banded, worst first.</summary>
    Task<IReadOnlyList<DivisionRiskDto>> GetDivisionRiskAsync(
        CancellationToken cancellationToken = default);

    /// <summary>The whole dashboard payload in one round trip.</summary>
    Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default);
}
