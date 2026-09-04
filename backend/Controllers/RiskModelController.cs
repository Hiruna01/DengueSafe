using HackathonApi.Dtos;
using HackathonApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/risk-model")]
[Produces("application/json")]
public class RiskModelController : ControllerBase
{
    private readonly IRiskService _riskService;

    public RiskModelController(IRiskService riskService) => _riskService = riskService;

    /// <summary>
    /// The weights and thresholds the scoring uses, so a client can show them
    /// rather than keep its own copy.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(RiskModelDto), StatusCodes.Status200OK)]
    public ActionResult<RiskModelDto> GetRiskModel() => Ok(_riskService.GetModel());
}
