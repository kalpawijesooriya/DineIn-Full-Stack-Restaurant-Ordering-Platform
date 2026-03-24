using System.Text.Json;
using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Infrastructure.Persistence.SeedData;

public static class SeedDataHelper
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Categories.AnyAsync())
        {
            return;
        }

        var categoriesFile = Path.Combine(AppContext.BaseDirectory, "Persistence", "SeedData", "categories.json");
        var menuItemsFile = Path.Combine(AppContext.BaseDirectory, "Persistence", "SeedData", "menuItems.json");

        if (!File.Exists(categoriesFile) || !File.Exists(menuItemsFile))
        {
            throw new FileNotFoundException("Seed JSON files were not found in output directory.");
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var categoriesJson = await File.ReadAllTextAsync(categoriesFile);
        var menuItemsJson = await File.ReadAllTextAsync(menuItemsFile);

        var categoryDtos = JsonSerializer.Deserialize<List<CategorySeedDto>>(categoriesJson, jsonOptions) ?? new List<CategorySeedDto>();
        var menuItemDtos = JsonSerializer.Deserialize<List<MenuItemSeedDto>>(menuItemsJson, jsonOptions) ?? new List<MenuItemSeedDto>();

        var categories = categoryDtos.Select(dto => new Category
        {
            Id = IdMapper.ToGuid(dto.Id),
            Name = dto.Name,
            ImageUrl = dto.ImageUrl,
            SortOrder = dto.SortOrder
        }).ToList();

        var menuItems = new List<MenuItem>();
        var groups = new List<CustomizationGroup>();
        var options = new List<CustomizationOption>();

        foreach (var menuItemDto in menuItemDtos)
        {
            var menuItem = new MenuItem
            {
                Id = IdMapper.ToGuid(menuItemDto.Id),
                Name = menuItemDto.Name,
                Description = menuItemDto.Description,
                Price = menuItemDto.Price,
                ImageUrl = menuItemDto.ImageUrl,
                CategoryId = IdMapper.ToGuid(menuItemDto.CategoryId),
                IsAvailable = menuItemDto.IsAvailable
            };

            menuItems.Add(menuItem);

            foreach (var groupDto in menuItemDto.CustomizationGroups)
            {
                var group = new CustomizationGroup
                {
                    Id = IdMapper.ToGuid(groupDto.Id),
                    Name = groupDto.Name,
                    Required = groupDto.Required,
                    MaxSelections = groupDto.MaxSelections,
                    MenuItemId = menuItem.Id
                };

                groups.Add(group);

                foreach (var optionDto in groupDto.Options)
                {
                    options.Add(new CustomizationOption
                    {
                        Id = IdMapper.ToGuid(optionDto.Id),
                        Name = optionDto.Name,
                        PriceAdjustment = optionDto.PriceAdjustment,
                        CustomizationGroupId = group.Id
                    });
                }
            }
        }

        await context.AddRangeAsync(categories);
        await context.AddRangeAsync(menuItems);
        await context.AddRangeAsync(groups);
        await context.AddRangeAsync(options);
        await context.SaveChangesAsync();
    }

    private sealed class CategorySeedDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }

    private sealed class MenuItemSeedDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;
        public List<CustomizationGroupSeedDto> CustomizationGroups { get; set; } = new();
        public bool IsAvailable { get; set; }
    }

    private sealed class CustomizationGroupSeedDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool Required { get; set; }
        public int MaxSelections { get; set; }
        public List<CustomizationOptionSeedDto> Options { get; set; } = new();
    }

    private sealed class CustomizationOptionSeedDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal PriceAdjustment { get; set; }
    }
}
