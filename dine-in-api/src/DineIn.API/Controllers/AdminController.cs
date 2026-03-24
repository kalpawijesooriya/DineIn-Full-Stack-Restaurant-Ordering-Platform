using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using DineIn.Domain.Entities;
using DineIn.Domain.Enums;
using DineIn.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DineIn.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IApplicationDbContext _db;

    public AdminController(IApplicationDbContext db)
    {
        _db = db;
    }

    // Categories CRUD

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync();
        return Ok(categories.Select(c => c.ToDto()));
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest req)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            ImageUrl = req.ImageUrl,
            SortOrder = req.SortOrder
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return Created($"/api/admin/categories/{category.Id}", category.ToDto());
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] CreateCategoryRequest req)
    {
        if (!Guid.TryParse(id, out var guid))
        {
            throw new NotFoundException("Category", id);
        }

        var category = await _db.Categories.FindAsync(guid) ?? throw new NotFoundException("Category", id);
        category.Name = req.Name;
        category.ImageUrl = req.ImageUrl;
        category.SortOrder = req.SortOrder;
        await _db.SaveChangesAsync();

        return Ok(category.ToDto());
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        if (!Guid.TryParse(id, out var guid))
        {
            throw new NotFoundException("Category", id);
        }

        var category = await _db.Categories.FindAsync(guid) ?? throw new NotFoundException("Category", id);
        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Menu items CRUD

    [HttpGet("menu-items")]
    public async Task<IActionResult> GetMenuItems(
        [FromQuery] string? categoryId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _db.MenuItems
            .Include(m => m.CustomizationGroups)
            .ThenInclude(g => g.Options)
            .AsQueryable();

        if (!string.IsNullOrEmpty(categoryId) && Guid.TryParse(categoryId, out var categoryGuid))
        {
            query = query.Where(m => m.CategoryId == categoryGuid);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(m => m.Name.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderBy(m => m.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items = items.Select(m => m.ToDto()),
            totalCount,
            page,
            pageSize,
            totalPages
        });
    }

    [HttpPost("menu-items")]
    public async Task<IActionResult> CreateMenuItem([FromBody] CreateMenuItemRequest req)
    {
        if (!Guid.TryParse(req.CategoryId, out var categoryGuid))
        {
            throw new NotFoundException("Category", req.CategoryId);
        }

        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Description = req.Description,
            Price = req.Price,
            ImageUrl = req.ImageUrl,
            CategoryId = categoryGuid,
            IsAvailable = req.IsAvailable
        };

        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();

        var created = await _db.MenuItems
            .Include(m => m.CustomizationGroups)
            .ThenInclude(g => g.Options)
            .FirstAsync(m => m.Id == item.Id);

        return Created($"/api/admin/menu-items/{item.Id}", created.ToDto());
    }

    [HttpPut("menu-items/{id}")]
    public async Task<IActionResult> UpdateMenuItem(string id, [FromBody] CreateMenuItemRequest req)
    {
        if (!Guid.TryParse(id, out var itemGuid))
        {
            throw new NotFoundException("MenuItem", id);
        }

        var item = await _db.MenuItems.FindAsync(itemGuid) ?? throw new NotFoundException("MenuItem", id);

        if (!Guid.TryParse(req.CategoryId, out var categoryGuid))
        {
            throw new NotFoundException("Category", req.CategoryId);
        }

        item.Name = req.Name;
        item.Description = req.Description;
        item.Price = req.Price;
        item.ImageUrl = req.ImageUrl;
        item.CategoryId = categoryGuid;
        item.IsAvailable = req.IsAvailable;
        await _db.SaveChangesAsync();

        var updated = await _db.MenuItems
            .Include(m => m.CustomizationGroups)
            .ThenInclude(g => g.Options)
            .FirstAsync(m => m.Id == itemGuid);

        return Ok(updated.ToDto());
    }

    [HttpPatch("menu-items/{id}/availability")]
    public async Task<IActionResult> ToggleAvailability(string id, [FromBody] ToggleAvailabilityRequest req)
    {
        if (!Guid.TryParse(id, out var itemGuid))
        {
            throw new NotFoundException("MenuItem", id);
        }

        var item = await _db.MenuItems.FindAsync(itemGuid) ?? throw new NotFoundException("MenuItem", id);
        item.IsAvailable = req.IsAvailable;
        await _db.SaveChangesAsync();

        return Ok(new { item.Id, item.IsAvailable });
    }

    [HttpDelete("menu-items/{id}")]
    public async Task<IActionResult> DeleteMenuItem(string id)
    {
        if (!Guid.TryParse(id, out var itemGuid))
        {
            throw new NotFoundException("MenuItem", id);
        }

        var item = await _db.MenuItems
            .Include(m => m.CustomizationGroups)
            .ThenInclude(g => g.Options)
            .FirstOrDefaultAsync(m => m.Id == itemGuid) ?? throw new NotFoundException("MenuItem", id);

        foreach (var group in item.CustomizationGroups)
        {
            _db.CustomizationOptions.RemoveRange(group.Options);
        }

        _db.CustomizationGroups.RemoveRange(item.CustomizationGroups);
        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Settings

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _db.RestaurantSettings.OrderBy(s => s.Key).ToListAsync();

        if (settings.Count == 0)
        {
            var defaults = new List<RestaurantSettings>
            {
                new() { Id = Guid.NewGuid(), Key = "tax_rate", Value = "0.08", Description = "Tax rate (e.g. 0.08 = 8%)", UpdatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Key = "delivery_fee", Value = "4.99", Description = "Delivery fee amount", UpdatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Key = "service_charge", Value = "0", Description = "Service charge percentage (e.g. 0.10 = 10%)", UpdatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Key = "estimated_pickup_minutes", Value = "20", Description = "Estimated pickup time in minutes", UpdatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Key = "estimated_delivery_minutes", Value = "40", Description = "Estimated delivery time in minutes", UpdatedAt = DateTime.UtcNow }
            };

            _db.RestaurantSettings.AddRange(defaults);
            await _db.SaveChangesAsync();
            settings = defaults;
        }

        return Ok(settings.Select(s => new RestaurantSettingsDto(
            s.Id.ToString(),
            s.Key,
            s.Value,
            s.Description,
            s.UpdatedAt.ToString("O"))));
    }

    [HttpPut("settings/{id}")]
    public async Task<IActionResult> UpdateSetting(string id, [FromBody] UpdateSettingRequest req)
    {
        if (!Guid.TryParse(id, out var settingGuid))
        {
            throw new NotFoundException("Setting", id);
        }

        var setting = await _db.RestaurantSettings.FindAsync(settingGuid) ?? throw new NotFoundException("Setting", id);
        setting.Value = req.Value;
        setting.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new RestaurantSettingsDto(
            setting.Id.ToString(),
            setting.Key,
            setting.Value,
            setting.Description,
            setting.UpdatedAt.ToString("O")));
    }

    // Dashboard

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var todayUtc = DateTime.UtcNow.Date;
        var orders = await _db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.SelectedCustomizations)
            .ToListAsync();

        var todayOrders = orders.Where(o => o.CreatedAt.Date == todayUtc).ToList();
        var activeOrders = orders.Where(o => o.Status is OrderStatus.Confirmed or OrderStatus.Preparing or OrderStatus.Ready).ToList();
        var completedToday = todayOrders.Where(o => o.Status == OrderStatus.Completed).ToList();

        var revenueToday = completedToday.Sum(o => o.Total);
        var averageOrderValue = completedToday.Count > 0 ? revenueToday / completedToday.Count : 0;

        var ordersByType = todayOrders
            .GroupBy(o => o.OrderType)
            .ToDictionary(
                g => g.Key switch
                {
                    OrderType.DineIn => "dine-in",
                    OrderType.Pickup => "pickup",
                    OrderType.Delivery => "delivery",
                    _ => "unknown"
                },
                g => g.Count());

        var recentOrders = orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => o.ToDto())
            .ToList();

        return Ok(new DashboardDto(
            todayOrders.Count,
            revenueToday,
            activeOrders.Count,
            completedToday.Count,
            averageOrderValue,
            ordersByType,
            recentOrders));
    }

    // Revenue report

    [HttpGet("reports/revenue")]
    public async Task<IActionResult> GetRevenueReport([FromQuery] string? from, [FromQuery] string? to)
    {
        var fromDate = DateTime.TryParse(from, out var parsedFrom)
            ? parsedFrom.Date
            : DateTime.UtcNow.Date.AddDays(-30);

        var toDate = DateTime.TryParse(to, out var parsedTo)
            ? parsedTo.Date.AddDays(1)
            : DateTime.UtcNow.Date.AddDays(1);

        var completedOrders = await _db.Orders
            .Where(o => o.CreatedAt >= fromDate && o.CreatedAt < toDate && o.Status == OrderStatus.Completed)
            .ToListAsync();

        var totalRevenue = completedOrders.Sum(o => o.Total);
        var totalOrders = completedOrders.Count;
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        var dailyBreakdown = completedOrders
            .GroupBy(o => o.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DailyRevenueDto(g.Key.ToString("yyyy-MM-dd"), g.Sum(o => o.Total), g.Count()))
            .ToList();

        var ordersByType = completedOrders
            .GroupBy(o => o.OrderType)
            .ToDictionary(
                g => g.Key switch
                {
                    OrderType.DineIn => "dine-in",
                    OrderType.Pickup => "pickup",
                    OrderType.Delivery => "delivery",
                    _ => "unknown"
                },
                g => g.Count());

        var allOrdersInRange = await _db.Orders
            .Where(o => o.CreatedAt >= fromDate && o.CreatedAt < toDate)
            .ToListAsync();

        var ordersByStatus = allOrdersInRange
            .GroupBy(o => o.Status)
            .ToDictionary(g => g.Key.ToString().ToLowerInvariant(), g => g.Count());

        return Ok(new RevenueReportDto(
            totalRevenue,
            totalOrders,
            averageOrderValue,
            dailyBreakdown,
            ordersByType,
            ordersByStatus));
    }

    // ─── Customization Groups CRUD ───

    [HttpPost("menu-items/{menuItemId}/customization-groups")]
    public async Task<IActionResult> CreateCustomizationGroup(string menuItemId, [FromBody] CreateCustomizationGroupRequest req)
    {
        if (!Guid.TryParse(menuItemId, out var itemGuid))
            throw new NotFoundException("MenuItem", menuItemId);

        var item = await _db.MenuItems.FindAsync(itemGuid) ?? throw new NotFoundException("MenuItem", menuItemId);

        var group = new CustomizationGroup
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Required = req.Required,
            MaxSelections = req.MaxSelections,
            MenuItemId = item.Id
        };
        _db.CustomizationGroups.Add(group);
        await _db.SaveChangesAsync();

        return Created($"/api/admin/customization-groups/{group.Id}",
            new CustomizationGroupDto(group.Id.ToString(), group.Name, group.Required, group.MaxSelections, new List<CustomizationOptionDto>()));
    }

    [HttpPut("customization-groups/{id}")]
    public async Task<IActionResult> UpdateCustomizationGroup(string id, [FromBody] CreateCustomizationGroupRequest req)
    {
        if (!Guid.TryParse(id, out var guid))
            throw new NotFoundException("CustomizationGroup", id);

        var group = await _db.CustomizationGroups
            .Include(g => g.Options)
            .FirstOrDefaultAsync(g => g.Id == guid) ?? throw new NotFoundException("CustomizationGroup", id);

        group.Name = req.Name;
        group.Required = req.Required;
        group.MaxSelections = req.MaxSelections;
        await _db.SaveChangesAsync();

        return Ok(new CustomizationGroupDto(
            group.Id.ToString(), group.Name, group.Required, group.MaxSelections,
            group.Options.Select(o => new CustomizationOptionDto(o.Id.ToString(), o.Name, o.PriceAdjustment)).ToList()));
    }

    [HttpDelete("customization-groups/{id}")]
    public async Task<IActionResult> DeleteCustomizationGroup(string id)
    {
        if (!Guid.TryParse(id, out var guid))
            throw new NotFoundException("CustomizationGroup", id);

        var group = await _db.CustomizationGroups
            .Include(g => g.Options)
            .FirstOrDefaultAsync(g => g.Id == guid) ?? throw new NotFoundException("CustomizationGroup", id);

        _db.CustomizationOptions.RemoveRange(group.Options);
        _db.CustomizationGroups.Remove(group);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ─── Customization Options CRUD ───

    [HttpPost("customization-groups/{groupId}/options")]
    public async Task<IActionResult> CreateCustomizationOption(string groupId, [FromBody] CreateCustomizationOptionRequest req)
    {
        if (!Guid.TryParse(groupId, out var gGuid))
            throw new NotFoundException("CustomizationGroup", groupId);

        var group = await _db.CustomizationGroups.FindAsync(gGuid) ?? throw new NotFoundException("CustomizationGroup", groupId);

        var option = new CustomizationOption
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            PriceAdjustment = req.PriceAdjustment,
            CustomizationGroupId = group.Id
        };
        _db.CustomizationOptions.Add(option);
        await _db.SaveChangesAsync();

        return Created($"/api/admin/customization-options/{option.Id}",
            new CustomizationOptionDto(option.Id.ToString(), option.Name, option.PriceAdjustment));
    }

    [HttpPut("customization-options/{id}")]
    public async Task<IActionResult> UpdateCustomizationOption(string id, [FromBody] CreateCustomizationOptionRequest req)
    {
        if (!Guid.TryParse(id, out var guid))
            throw new NotFoundException("CustomizationOption", id);

        var option = await _db.CustomizationOptions.FindAsync(guid) ?? throw new NotFoundException("CustomizationOption", id);
        option.Name = req.Name;
        option.PriceAdjustment = req.PriceAdjustment;
        await _db.SaveChangesAsync();

        return Ok(new CustomizationOptionDto(option.Id.ToString(), option.Name, option.PriceAdjustment));
    }

    [HttpDelete("customization-options/{id}")]
    public async Task<IActionResult> DeleteCustomizationOption(string id)
    {
        if (!Guid.TryParse(id, out var guid))
            throw new NotFoundException("CustomizationOption", id);

        var option = await _db.CustomizationOptions.FindAsync(guid) ?? throw new NotFoundException("CustomizationOption", id);
        _db.CustomizationOptions.Remove(option);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("customization-groups")]
    public async Task<IActionResult> GetAllCustomizationGroups()
    {
        var groups = await _db.CustomizationGroups
            .Include(g => g.Options)
            .Include(g => g.MenuItem)
            .OrderBy(g => g.Name)
            .ToListAsync();

        return Ok(groups.Select(g => new
        {
            g.Id,
            g.Name,
            g.Required,
            g.MaxSelections,
            g.MenuItemId,
            MenuItemName = g.MenuItem.Name,
            Options = g.Options.Select(o => new
            {
                o.Id,
                o.Name,
                o.PriceAdjustment
            })
        }));
    }

    [HttpPost("customization-groups/{groupId}/clone/{menuItemId}")]
    public async Task<IActionResult> CloneGroupToMenuItem(Guid groupId, Guid menuItemId)
    {
        var source = await _db.CustomizationGroups
            .Include(g => g.Options)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (source == null)
            return NotFound("Group not found");

        var menuItem = await _db.MenuItems.FindAsync(menuItemId);
        if (menuItem == null)
            return NotFound("Menu item not found");

        var clone = new CustomizationGroup
        {
            Id = Guid.NewGuid(),
            Name = source.Name,
            Required = source.Required,
            MaxSelections = source.MaxSelections,
            MenuItemId = menuItemId,
            Options = source.Options.Select(o => new CustomizationOption
            {
                Id = Guid.NewGuid(),
                Name = o.Name,
                PriceAdjustment = o.PriceAdjustment
            }).ToList()
        };

        _db.CustomizationGroups.Add(clone);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            clone.Id,
            clone.Name,
            clone.Required,
            clone.MaxSelections,
            Options = clone.Options.Select(o => new
            {
                o.Id,
                o.Name,
                o.PriceAdjustment
            })
        });
    }

    // All orders with filters

    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders([FromQuery] string? status, [FromQuery] string? type, [FromQuery] string? from, [FromQuery] string? to)
    {
        var query = _db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.SelectedCustomizations)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(o => o.Status == parsedStatus);
        }

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<OrderType>(type, true, out var parsedType))
        {
            query = query.Where(o => o.OrderType == parsedType);
        }

        if (DateTime.TryParse(from, out var fromDate))
        {
            query = query.Where(o => o.CreatedAt >= fromDate.Date);
        }

        if (DateTime.TryParse(to, out var toDate))
        {
            query = query.Where(o => o.CreatedAt < toDate.Date.AddDays(1));
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(o => o.ToDto()));
    }
}

public record CreateCategoryRequest(string Name, string ImageUrl, int SortOrder);
public record CreateMenuItemRequest(string Name, string Description, decimal Price, string ImageUrl, string CategoryId, bool IsAvailable);
public record ToggleAvailabilityRequest(bool IsAvailable);
public record UpdateSettingRequest(string Value);
public record CreateCustomizationGroupRequest(string Name, bool Required, int MaxSelections);
public record CreateCustomizationOptionRequest(string Name, decimal PriceAdjustment);
