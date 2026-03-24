using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Domain.Entities;

namespace DineIn.Application.Mappings;

public static class MappingExtensions
{
    public static CategoryDto ToDto(this Category entity)
    {
        return new CategoryDto(entity.Id.ToString(), entity.Name, entity.ImageUrl, entity.SortOrder);
    }

    public static MenuItemDto ToDto(this MenuItem entity)
    {
        var groups = entity.CustomizationGroups
            .Select(group => new CustomizationGroupDto(
                group.Id.ToString(),
                group.Name,
                group.Required,
                group.MaxSelections,
                group.Options
                    .Select(option => new CustomizationOptionDto(
                        option.Id.ToString(),
                        option.Name,
                        option.PriceAdjustment))
                    .ToList()))
            .ToList();

        return new MenuItemDto(
            entity.Id.ToString(),
            entity.Name,
            entity.Description,
            entity.Price,
            entity.ImageUrl,
            entity.CategoryId.ToString(),
            groups,
            entity.IsAvailable);
    }

    public static OrderDto ToDto(this Order entity)
    {
        OrderTypeDetailsDto details = entity.OrderType switch
        {
            Domain.Enums.OrderType.DineIn => new DineInDetailsDto(entity.TableNumber ?? string.Empty),
            Domain.Enums.OrderType.Pickup => new PickupDetailsDto(entity.CustomerName ?? string.Empty, entity.PhoneNumber ?? string.Empty, entity.EstimatedTime ?? string.Empty),
            Domain.Enums.OrderType.Delivery => new DeliveryDetailsDto(entity.CustomerName ?? string.Empty, entity.PhoneNumber ?? string.Empty, new AddressDto(entity.Street ?? string.Empty, entity.City ?? string.Empty, entity.Zip ?? string.Empty), entity.DeliveryFee ?? 0, entity.EstimatedTime ?? string.Empty),
            _ => throw new ArgumentOutOfRangeException()
        };

        var orderType = entity.OrderType switch
        {
            Domain.Enums.OrderType.DineIn => "dine-in",
            Domain.Enums.OrderType.Pickup => "pickup",
            Domain.Enums.OrderType.Delivery => "delivery",
            _ => throw new ArgumentOutOfRangeException()
        };

        return new OrderDto(
            entity.Id.ToString(),
            orderType,
            details,
            entity.Items.Select(i => i.ToDto()).ToList(),
            entity.Subtotal,
            entity.Tax,
            entity.Total,
            entity.Status.ToString().ToLowerInvariant(),
            entity.CreatedAt.ToString("O"),
            entity.PaymentIntentId,
            entity.PaymentMethod == Domain.Enums.PaymentMethod.None ? null : entity.PaymentMethod.ToString().ToLowerInvariant(),
            entity.PaymentStatus.ToString().ToLowerInvariant(),
            entity.AmountTendered,
            entity.ChangeGiven,
            entity.CashierId);
    }

    public static OrderItemDto ToDto(this OrderItem entity, IApplicationDbContext context)
    {
        _ = context;
        return entity.ToDto();
    }

    public static OrderItemDto ToDto(this OrderItem entity)
    {
        var selectedCustomizations = entity.SelectedCustomizations
            .GroupBy(c => c.CustomizationGroupId.ToString())
            .ToDictionary(
                g => g.Key,
                g => g.Select(c => c.CustomizationOptionId.ToString()).ToList());

        var menuItem = new MenuItemDto(
            entity.MenuItemId.ToString(),
            entity.MenuItemName,
            string.Empty,
            entity.MenuItemPrice,
            string.Empty,
            string.Empty,
            new List<CustomizationGroupDto>(),
            true);

        return new OrderItemDto(
            entity.Id.ToString(),
            menuItem,
            entity.Quantity,
            selectedCustomizations,
            entity.SpecialInstructions ?? string.Empty,
            entity.ItemTotal);
    }
}
