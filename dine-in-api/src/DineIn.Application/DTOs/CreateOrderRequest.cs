namespace DineIn.Application.DTOs;

public class CreateOrderRequest
{
    public string OrderType { get; set; } = string.Empty;
    public string? TableNumber { get; set; }
    public string? CustomerName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? Zip { get; set; }
    public string? PaymentMethod { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public string MenuItemId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public Dictionary<string, List<string>> SelectedCustomizations { get; set; } = new();
    public string? SpecialInstructions { get; set; }
}
