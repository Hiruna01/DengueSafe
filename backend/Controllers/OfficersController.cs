using HackathonApi.Dtos;
using HackathonApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HackathonApi.Controllers;

/// <summary>
/// Account administration. Admin-only in full: an Officer works the queue and
/// the cases, but does not decide who else gets in.
/// </summary>
[ApiController]
[Route("api/officers")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public class OfficersController : ControllerBase
{
    private readonly IOfficerService _officerService;

    public OfficersController(IOfficerService officerService) => _officerService = officerService;

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<OfficerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<OfficerDto>>> GetOfficers(
        [FromQuery] OfficerQueryParameters query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _officerService.GetAllAsync(query, cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType(typeof(OfficerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<OfficerDto>> CreateOfficer(
        [FromBody] CreateOfficerDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var created = await _officerService.CreateAsync(dto, User.GetOfficerId(), cancellationToken);

        return CreatedAtAction(nameof(GetOfficers), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(OfficerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OfficerDto>> UpdateOfficer(
        int id,
        [FromBody] UpdateOfficerDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _officerService.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpPatch("{id:int}/active")]
    [ProducesResponseType(typeof(OfficerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OfficerDto>> SetOfficerActive(
        int id,
        [FromBody] SetOfficerActiveDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _officerService.SetActiveAsync(
            id,
            dto.IsActive!.Value,
            User.GetOfficerId(),
            cancellationToken));
    }
}
