using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using DineIn.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersHandler(IApplicationDbContext dbContext) : IRequestHandler<GetOrdersQuery, List<OrderDto>>
{
    public async Task<List<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.SelectedCustomizations)
            .AsQueryable();

        if (request.Statuses is { Count: > 0 })
        {
            var parsedStatuses = request.Statuses
                .Select(x => Enum.TryParse<OrderStatus>(x, true, out var status) ? status : (OrderStatus?)null)
                .Where(x => x.HasValue)
                .Select(x => x!.Value)
                .Distinct()
                .ToList();

            if (parsedStatuses.Count > 0)
            {
                query = query.Where(x => parsedStatuses.Contains(x.Status));
            }
        }

        var orders = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(x => x.ToDto()).ToList();
    }
}