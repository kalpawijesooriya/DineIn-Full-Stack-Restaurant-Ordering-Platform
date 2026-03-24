using DineIn.Application.Features.MenuItems.Queries.GetMenuItemById;
using DineIn.Application.Features.MenuItems.Queries.GetMenuItems;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DineIn.API.Controllers;

[ApiController]
[Route("api/menu-items")]
public class MenuItemsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MenuItemsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET /api/menu-items?categoryId=xxx
    [HttpGet]
    public async Task<IActionResult> GetMenuItems([FromQuery] string? categoryId)
    {
        var result = await _mediator.Send(new GetMenuItemsQuery(categoryId));
        return Ok(result);
    }

    // GET /api/menu-items/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMenuItemById(string id)
    {
        var result = await _mediator.Send(new GetMenuItemByIdQuery(id));
        return Ok(result);
    }
}
