using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.Orders.Queries.GetOrders;

public record GetOrdersQuery(List<string>? Statuses = null) : IRequest<List<OrderDto>>;