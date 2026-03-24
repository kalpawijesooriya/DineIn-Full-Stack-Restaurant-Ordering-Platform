using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.Orders.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand(string OrderId, string Status) : IRequest<OrderDto>;