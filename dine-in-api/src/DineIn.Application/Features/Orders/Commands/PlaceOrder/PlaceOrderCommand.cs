using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.Orders.Commands.PlaceOrder;

public record PlaceOrderCommand(
    string OrderType,
    string? TableNumber,
    string? CustomerName,
    string? PhoneNumber,
    string? Street,
    string? City,
    string? Zip,
    string? PaymentMethod,
    List<CreateOrderItemRequest> Items
) : IRequest<OrderDto>;