using HackathonApi.Dtos;
using HackathonApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/cases")]
[Produces("application/json")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly ICaseService _caseService;

    public CasesController(ICaseService caseService) => _caseService = caseService;

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CaseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<CaseDto>>> GetCases(
        [FromQuery] CaseQueryParameters query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _caseService.GetCasesAsync(query, cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType(typeof(CaseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CaseDto>> CreateCase(
        [FromBody] CreateCaseDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var created = await _caseService.CreateAsync(dto, cancellationToken);

        // No GET-by-id for cases, so the created row is returned inline.
        return StatusCode(StatusCodes.Status201Created, created);
    }
}
