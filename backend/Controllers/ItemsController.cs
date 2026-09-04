using HackathonApi.Dtos;
using HackathonApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HackathonApi.Controllers;

[ApiController]
[Route("api/items")]
[Produces("application/json")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;

    public ItemsController(IItemService itemService) => _itemService = itemService;

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<ItemDto>>> GetItems(
        [FromQuery] ItemQueryParameters query,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _itemService.GetAsync(query, cancellationToken));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> GetItem(int id, CancellationToken cancellationToken)
        => Ok(await _itemService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ItemDto>> CreateItem(
        [FromBody] CreateItemDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var created = await _itemService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(nameof(GetItem), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> UpdateItem(
        int id,
        [FromBody] UpdateItemDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _itemService.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> UpdateItemStatus(
        int id,
        [FromBody] UpdateItemStatusDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        return Ok(await _itemService.UpdateStatusAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteItem(int id, CancellationToken cancellationToken)
    {
        await _itemService.DeleteAsync(id, cancellationToken);

        return NoContent();
    }
}
