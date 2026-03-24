namespace DineIn.Application.DTOs;

public record CustomizationGroupDto(string Id, string Name, bool Required, int MaxSelections, List<CustomizationOptionDto> Options);
