using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using DineIn.Domain.Enums;
using DineIn.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusHandler(IApplicationDbContext dbContext) : IRequestHandler<UpdateOrderStatusCommand, OrderDto>
{
    public async Task<OrderDto> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.OrderId, out var orderId))
        {
            throw new NotFoundException("Order", request.OrderId);
        }

        var order = await dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.SelectedCustomizations)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (order is null)
        {
            throw new NotFoundException("Order", request.OrderId);
        }

        var requestedStatus = request.Status.Trim().ToLowerInvariant();

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var parsedStatus))
        {
            throw new InvalidStatusTransitionException(order.Status.ToString().ToLowerInvariant(), requestedStatus);
        }

        if (!IsValidTransition(order.Status, parsedStatus))
        {
            throw new InvalidStatusTransitionException(order.Status.ToString().ToLowerInvariant(), requestedStatus);
        }

        order.Status = parsedStatus;
        await dbContext.SaveChangesAsync(cancellationToken);

        return order.ToDto();
    }

    private static bool IsValidTransition(OrderStatus currentStatus, OrderStatus requestedStatus)
    {
        return (currentStatus, requestedStatus) switch
        {
            (OrderStatus.Confirmed, OrderStatus.Preparing) => true,
            (OrderStatus.Preparing, OrderStatus.Ready) => true,
            (OrderStatus.Ready, OrderStatus.Completed) => true,
            _ => false
        };
    }
}