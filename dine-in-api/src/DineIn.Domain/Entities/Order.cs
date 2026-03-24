using DineIn.Domain.Enums;

namespace DineIn.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public OrderType OrderType { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public string? TableNumber { get; set; }

    public string? CustomerName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EstimatedTime { get; set; }

    public string? Street { get; set; }
    public string? City { get; set; }
    public string? Zip { get; set; }
    public decimal? DeliveryFee { get; set; }

    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }

    public string? PaymentIntentId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.None;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public decimal? AmountTendered { get; set; }
    public decimal? ChangeGiven { get; set; }
    public string? CashierId { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}