namespace DineIn.Domain.Entities;

public class OrderItemCustomization
{
    public Guid Id { get; set; }
    public Guid OrderItemId { get; set; }

    public Guid CustomizationGroupId { get; set; }
    public string CustomizationGroupName { get; set; } = string.Empty;
    public Guid CustomizationOptionId { get; set; }
    public string CustomizationOptionName { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }

    public OrderItem OrderItem { get; set; } = null!;
}