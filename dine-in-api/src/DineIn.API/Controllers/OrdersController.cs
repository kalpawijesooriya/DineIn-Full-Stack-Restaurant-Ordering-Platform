using DineIn.API.Hubs;
using DineIn.Application.DTOs;
using DineIn.Application.Features.Orders.Commands.PlaceOrder;
using DineIn.Application.Features.Orders.Commands.UpdateOrderStatus;
using DineIn.Application.Features.Orders.Queries.GetOrderById;
using DineIn.Application.Features.Orders.Queries.GetOrders;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DineIn.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHubContext<OrderHub> _hubContext;

    public OrdersController(IMediator mediator, IHubContext<OrderHub> hubContext)
    {
        _mediator = mediator;
        _hubContext = hubContext;
    }

    // POST /api/orders — body is CreateOrderRequest, maps to PlaceOrderCommand
    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderRequest request)
    {
        var result = await _mediator.Send(new PlaceOrderCommand(
            request.OrderType,
            request.TableNumber,
            request.CustomerName,
            request.PhoneNumber,
            request.Street,
            request.City,
            request.Zip,
            request.PaymentMethod,
            request.Items));
        await _hubContext.Clients.All.SendAsync("OrderCreated", result);
        return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, result);
    }

    // GET /api/orders
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status)
    {
        var statuses = status?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
        var result = await _mediator.Send(new GetOrdersQuery(statuses));
        return Ok(result);
    }

    // GET /api/orders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id));
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusRequest request)
    {
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, request.Status));
        await _hubContext.Clients.All.SendAsync("OrderUpdated", result);
        return Ok(result);
    }
}

public record UpdateOrderStatusRequest(string Status);
