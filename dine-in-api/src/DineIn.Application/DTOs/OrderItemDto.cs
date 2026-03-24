namespace DineIn.Application.DTOs;

public record OrderItemDto(
    string Id,
    MenuItemDto MenuItem,
    int Quantity,
    Dictionary<string, List<string>> SelectedCustomizations,
    string SpecialInstructions,
    decimal ItemTotal);
