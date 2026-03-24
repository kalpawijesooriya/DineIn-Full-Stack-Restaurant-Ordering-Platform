namespace DineIn.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid MenuItemId { get; set; }

    public string MenuItemName { get; set; } = string.Empty;
    public decimal MenuItemPrice { get; set; }
    public int Quantity { get; set; }
    public string? SpecialInstructions { get; set; }
    public decimal ItemTotal { get; set; }

    public Order Order { get; set; } = null!;
    public ICollection<OrderItemCustomization> SelectedCustomizations { get; set; } = new List<OrderItemCustomization>();
}