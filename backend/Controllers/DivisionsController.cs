using HackathonApi.Dtos;
using HackathonApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/divisions")]
[Produces("application/json")]
public class DivisionsController : ControllerBase
{
    private readonly IDivisionService _divisionService;

    public DivisionsController(IDivisionService divisionService) => _divisionService = divisionService;

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<DivisionRiskDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DivisionRiskDto>>> GetDivisions(
        CancellationToken cancellationToken)
        => Ok(await _divisionService.GetDivisionRiskAsync(cancellationToken));

    /// <summary>
    /// The officer dashboard payload. Authorised — unlike <c>GET /api/divisions</c>
    /// above, which is the public risk board and what the landing page reads.
    /// </summary>
    [HttpGet("dashboard")]
    [Authorize]
    [ProducesResponseType(typeof(DashboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DashboardDto>> GetDashboard(CancellationToken cancellationToken)
        => Ok(await _divisionService.GetDashboardAsync(cancellationToken));
}
