namespace DineIn.Application.DTOs;

public record MenuItemDto(string Id, string Name, string Description, decimal Price, string ImageUrl, string CategoryId, List<CustomizationGroupDto> CustomizationGroups, bool IsAvailable);
