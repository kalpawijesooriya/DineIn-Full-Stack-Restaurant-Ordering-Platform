namespace DineIn.Application.DTOs;

public record OrderDto(
    string Id,
    string OrderType,
    OrderTypeDetailsDto OrderTypeDetails,
    List<OrderItemDto> Items,
    decimal Subtotal,
    decimal Tax,
    decimal Total,
    string Status,
    string CreatedAt,
    string? PaymentIntentId,
    string? PaymentMethod,
    string? PaymentStatus,
    decimal? AmountTendered,
    decimal? ChangeGiven,
    string? CashierId);
