using System.Globalization;
using System.Security.Claims;
using DineIn.API.Hubs;
using DineIn.Application.Mappings;
using DineIn.Application.Interfaces;
using DineIn.Domain.Entities;
using DineIn.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.API.Controllers;

[ApiController]
[Route("api/cashier")]
[Authorize(Policy = "CashierOrAdmin")]
public class CashierController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly IHubContext<OrderHub> _hub;

    public CashierController(IApplicationDbContext db, IHubContext<OrderHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    // GET /api/cashier/menu
    [HttpGet("menu")]
    public async Task<IActionResult> GetMenu()
    {
        var categories = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync();
        var items = await _db.MenuItems
            .Include(m => m.CustomizationGroups)
            .ThenInclude(g => g.Options)
            .Where(m => m.IsAvailable)
            .OrderBy(m => m.Name)
            .ToListAsync();

        return Ok(new
        {
            categories = categories.Select(c => new { c.Id, c.Name, c.ImageUrl, c.SortOrder }),
            items = items.Select(m => m.ToDto())
        });
    }

    // POST /api/cashier/orders
    [HttpPost("orders")]
    public async Task<IActionResult> PlaceOrder([FromBody] CashierPlaceOrderRequest request)
    {
        if (!TryParseOrderType(request.OrderType, out var orderType))
        {
            return BadRequest("Invalid order type. Use: dine-in, pickup, or delivery");
        }

        // Parse payment method — "none" means pay later
        var paymentMethod = PaymentMethod.None;
        if (!string.IsNullOrEmpty(request.PaymentMethod) && request.PaymentMethod.ToLowerInvariant() != "none")
        {
            if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out paymentMethod))
                return BadRequest("Invalid payment method. Use: Cash, Card, or None (pay later)");

            if (paymentMethod != PaymentMethod.Cash && paymentMethod != PaymentMethod.Card)
                return BadRequest("Invalid payment method. Use: Cash, Card, or None (pay later)");
        }

        var isPaid = paymentMethod != PaymentMethod.None;

        if (request.Items is null || request.Items.Count == 0)
        {
            return BadRequest("Order must contain at least one item.");
        }

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                return BadRequest("Item quantity must be greater than zero.");
            }

            if (!Guid.TryParse(item.MenuItemId, out var menuItemGuid))
            {
                return BadRequest($"Invalid menu item ID: {item.MenuItemId}");
            }

            var menuItem = await _db.MenuItems
                .Include(m => m.CustomizationGroups)
                .ThenInclude(g => g.Options)
                .FirstOrDefaultAsync(m => m.Id == menuItemGuid);

            if (menuItem == null)
            {
                return BadRequest($"Menu item not found: {item.MenuItemId}");
            }

            if (!menuItem.IsAvailable)
            {
                return BadRequest($"Menu item not available: {menuItem.Name}");
            }

            decimal customizationTotal = 0;
            var selectedCustomizations = new List<OrderItemCustomization>();

            if (item.SelectedCustomizations != null)
            {
                foreach (var (groupId, optionIds) in item.SelectedCustomizations)
                {
                    if (!Guid.TryParse(groupId, out var groupGuid))
                    {
                        return BadRequest($"Invalid customization group ID: {groupId}");
                    }

                    var group = menuItem.CustomizationGroups.FirstOrDefault(g => g.Id == groupGuid);
                    if (group == null)
                    {
                        return BadRequest($"Customization group not found for item {menuItem.Name}: {groupId}");
                    }

                    foreach (var optionId in optionIds)
                    {
                        if (!Guid.TryParse(optionId, out var optionGuid))
                        {
                            return BadRequest($"Invalid customization option ID: {optionId}");
                        }

                        var option = group.Options.FirstOrDefault(o => o.Id == optionGuid);
                        if (option == null)
                        {
                            return BadRequest($"Customization option not found: {optionId}");
                        }

                        customizationTotal += option.PriceAdjustment;
                        selectedCustomizations.Add(new OrderItemCustomization
                        {
                            Id = Guid.NewGuid(),
                            CustomizationGroupId = group.Id,
                            CustomizationGroupName = group.Name,
                            CustomizationOptionId = option.Id,
                            CustomizationOptionName = option.Name,
                            PriceAdjustment = option.PriceAdjustment
                        });
                    }
                }
            }

            var unitPrice = menuItem.Price + customizationTotal;
            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = menuItem.Id,
                MenuItemName = menuItem.Name,
                MenuItemPrice = menuItem.Price,
                Quantity = item.Quantity,
                SpecialInstructions = item.SpecialInstructions,
                ItemTotal = unitPrice * item.Quantity,
                SelectedCustomizations = selectedCustomizations
            };

            orderItems.Add(orderItem);
            subtotal += orderItem.ItemTotal;
        }

        var taxRateSetting = await _db.RestaurantSettings.FirstOrDefaultAsync(s => s.Key == "tax_rate");
        var taxRate = ParseDecimalSetting(taxRateSetting?.Value, 0.08m);
        var tax = Math.Round(subtotal * taxRate, 2, MidpointRounding.AwayFromZero);

        decimal deliveryFee = 0;
        if (orderType == OrderType.Delivery)
        {
            var deliveryFeeSetting = await _db.RestaurantSettings.FirstOrDefaultAsync(s => s.Key == "delivery_fee");
            deliveryFee = ParseDecimalSetting(deliveryFeeSetting?.Value, 4.99m);
        }

        var total = subtotal + tax + deliveryFee;

        if (paymentMethod == PaymentMethod.Cash)
        {
            if (request.AmountTendered == null || request.AmountTendered < total)
                return BadRequest($"Insufficient cash amount. Total is {total:C}");
        }

        var cashierId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        var nowUtc = DateTime.UtcNow;
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderType = orderType,
            Status = OrderStatus.Confirmed,
            CreatedAt = nowUtc,
            Items = orderItems,
            Subtotal = subtotal,
            Tax = tax,
            Total = total,
            PaymentMethod = paymentMethod,
            PaymentStatus = isPaid ? PaymentStatus.Paid : PaymentStatus.Unpaid,
            AmountTendered = paymentMethod == PaymentMethod.Cash ? request.AmountTendered : null,
            ChangeGiven = paymentMethod == PaymentMethod.Cash ? request.AmountTendered - total : null,
            CashierId = cashierId,
            DeliveryFee = orderType == OrderType.Delivery ? deliveryFee : null
        };

        switch (orderType)
        {
            case OrderType.DineIn:
                order.TableNumber = request.TableNumber;
                break;
            case OrderType.Pickup:
                order.CustomerName = request.CustomerName;
                order.PhoneNumber = request.PhoneNumber;
                order.EstimatedTime = nowUtc.AddMinutes(20).ToString("h:mm tt", CultureInfo.InvariantCulture);
                break;
            case OrderType.Delivery:
                order.CustomerName = request.CustomerName;
                order.PhoneNumber = request.PhoneNumber;
                order.Street = request.Street;
                order.City = request.City;
                order.Zip = request.Zip;
                order.EstimatedTime = nowUtc.AddMinutes(40).ToString("h:mm tt", CultureInfo.InvariantCulture);
                break;
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var createdOrder = await _db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.SelectedCustomizations)
            .FirstAsync(o => o.Id == order.Id);

        var orderDto = createdOrder.ToDto();
        await _hub.Clients.All.SendAsync("OrderCreated", orderDto);

        return Created($"/api/cashier/orders/{order.Id}", orderDto);
    }

    // GET /api/cashier/orders
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] string? status)
    {
        var query = _db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.SelectedCustomizations)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(o => o.Status == parsedStatus);
        }
        else
        {
            query = query.Where(o => o.Status != OrderStatus.Completed);
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(o => o.ToDto()));
    }

    // PATCH /api/cashier/orders/{id}/complete
    [HttpPatch("orders/{id:guid}/complete")]
    public async Task<IActionResult> CompleteOrder(Guid id)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.SelectedCustomizations)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        if (order.Status != OrderStatus.Ready)
        {
            return BadRequest($"Order must be in Ready status to complete. Current status: {order.Status}");
        }

        if (order.PaymentStatus != PaymentStatus.Paid)
            return BadRequest("Order must be paid before completing. Process payment first.");

        order.Status = OrderStatus.Completed;
        await _db.SaveChangesAsync();

        var dto = order.ToDto();
        await _hub.Clients.All.SendAsync("OrderUpdated", dto);

        return Ok(dto);
    }

    [HttpPatch("orders/{id:guid}/payment")]
    public async Task<IActionResult> ProcessPayment(Guid id, [FromBody] CashierProcessPaymentRequest request)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.SelectedCustomizations)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();
        if (order.PaymentStatus == PaymentStatus.Paid)
            return BadRequest("Order is already paid");

        if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var paymentMethod)
            || paymentMethod == PaymentMethod.None)
            return BadRequest("Invalid payment method. Use: Cash or Card");

        if (paymentMethod != PaymentMethod.Cash && paymentMethod != PaymentMethod.Card)
            return BadRequest("Invalid payment method. Use: Cash or Card");

        if (paymentMethod == PaymentMethod.Cash)
        {
            if (request.AmountTendered == null || request.AmountTendered < order.Total)
                return BadRequest($"Insufficient cash amount. Total is {order.Total:C}");
        }

        var cashierId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        order.PaymentMethod = paymentMethod;
        order.PaymentStatus = PaymentStatus.Paid;
        order.AmountTendered = paymentMethod == PaymentMethod.Cash ? request.AmountTendered : null;
        order.ChangeGiven = paymentMethod == PaymentMethod.Cash ? request.AmountTendered - order.Total : null;
        order.CashierId = cashierId;

        await _db.SaveChangesAsync();

        var dto = order.ToDto();
        await _hub.Clients.All.SendAsync("OrderUpdated", dto);

        return Ok(dto);
    }

    // GET /api/cashier/menu-items
    [HttpGet("menu-items")]
    public async Task<IActionResult> GetMenuItems()
    {
        var items = await _db.MenuItems
            .Include(m => m.CustomizationGroups)
            .ThenInclude(g => g.Options)
            .OrderBy(m => m.Name)
            .ToListAsync();

        return Ok(items.Select(m => m.ToDto()));
    }

    // PATCH /api/cashier/menu-items/{id}/availability
    [HttpPatch("menu-items/{id:guid}/availability")]
    public async Task<IActionResult> ToggleAvailability(Guid id, [FromBody] CashierToggleAvailabilityRequest req)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.IsAvailable = req.IsAvailable;
        await _db.SaveChangesAsync();

        return Ok(new { item.Id, item.IsAvailable });
    }

    private static bool TryParseOrderType(string value, out OrderType orderType)
    {
        var normalized = value.Trim().ToLowerInvariant();
        if (normalized == "dine-in")
        {
            orderType = OrderType.DineIn;
            return true;
        }

        if (normalized == "pickup")
        {
            orderType = OrderType.Pickup;
            return true;
        }

        if (normalized == "delivery")
        {
            orderType = OrderType.Delivery;
            return true;
        }

        return Enum.TryParse(value, true, out orderType);
    }

    private static decimal ParseDecimalSetting(string? settingValue, decimal defaultValue)
    {
        if (decimal.TryParse(settingValue, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }

        return defaultValue;
    }
}

public record CashierPlaceOrderRequest(
    string OrderType,
    string? TableNumber,
    string? CustomerName,
    string? PhoneNumber,
    string? Street,
    string? City,
    string? Zip,
    string PaymentMethod,
    decimal? AmountTendered,
    List<CashierOrderItemRequest> Items);

public record CashierOrderItemRequest(
    string MenuItemId,
    int Quantity,
    Dictionary<string, List<string>>? SelectedCustomizations,
    string? SpecialInstructions);

public record CashierToggleAvailabilityRequest(bool IsAvailable);

public record CashierProcessPaymentRequest(string PaymentMethod, decimal? AmountTendered);
