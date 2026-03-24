using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.Orders.Queries.GetOrderById;

public record GetOrderByIdQuery(string Id) : IRequest<OrderDto>;