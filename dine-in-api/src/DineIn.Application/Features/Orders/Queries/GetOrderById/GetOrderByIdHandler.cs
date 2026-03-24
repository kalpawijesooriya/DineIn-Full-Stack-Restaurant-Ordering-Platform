using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using DineIn.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.Orders.Queries.GetOrderById;

public class GetOrderByIdHandler(IApplicationDbContext dbContext) : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var orderId))
        {
            throw new NotFoundException("Order", request.Id);
        }

        var order = await dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.SelectedCustomizations)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

        if (order is null)
        {
            throw new NotFoundException("Order", request.Id);
        }

        return order.ToDto();
    }
}