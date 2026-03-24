using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.Payments.Commands.SimulatePayment;

public class SimulatePaymentHandler(IApplicationDbContext dbContext) : IRequestHandler<SimulatePaymentCommand, PaymentSimulationDto>
{
    public async Task<PaymentSimulationDto> Handle(SimulatePaymentCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.OrderId, out var orderId))
        {
            throw new NotFoundException("Order", request.OrderId);
        }

        var order = await dbContext.Orders.FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);
        if (order is null)
        {
            throw new NotFoundException("Order", request.OrderId);
        }

        var paymentIntentId = $"pi_simulated_{Guid.NewGuid().ToString("N")[..16]}";
        order.PaymentIntentId = paymentIntentId;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new PaymentSimulationDto(true, paymentIntentId, "Payment simulated successfully");
    }
}