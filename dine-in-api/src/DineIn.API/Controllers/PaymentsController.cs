using DineIn.Application.Features.Payments.Commands.SimulatePayment;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DineIn.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // POST /api/payments/simulate — body: { orderId, amount }
    [HttpPost("simulate")]
    public async Task<IActionResult> SimulatePayment([FromBody] SimulatePaymentCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
