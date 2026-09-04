using HackathonApi.Dtos;
using HackathonApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/reports")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService) => _reportService = reportService;

    /// <summary>
    /// The inspection queue. Authorised: the list carries reporter names, and
    /// an unfiltered view of every reported site is not public information.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResult<ReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedResult<ReportDto>>> GetReports(
        [FromQuery] ReportQueryParameters query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _reportService.GetReportsAsync(query, cancellationToken));
    }

    /// <summary>
    /// What one number has reported. Anonymous, because there is no sign-in for
    /// residents — the number they filed under is what identifies their own
    /// submissions, and <see cref="ReportDto"/> never returns a phone number.
    /// </summary>
    [HttpGet("by-phone")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<ReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<ReportDto>>> GetReportsByPhone(
        [FromQuery] ReportPhoneLookupParameters lookup,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var query = new ReportQueryParameters
        {
            Phone = lookup.Phone,
            Page = lookup.Page,
            PageSize = lookup.PageSize
        };

        return Ok(await _reportService.GetReportsAsync(query, cancellationToken));
    }

    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportDto>> GetReport(int id, CancellationToken cancellationToken)
        => Ok(await _reportService.GetByIdAsync(id, cancellationToken));

    /// <summary>
    /// Anonymous by design: a resident reporting standing water must not need
    /// an account to do it.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportDto>> CreateReport(
        [FromBody] CreateReportDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var created = await _reportService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(nameof(GetReport), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportDto>> UpdateReportStatus(
        int id,
        [FromBody] UpdateReportStatusDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _reportService.UpdateStatusAsync(id, dto, cancellationToken));
    }
}
