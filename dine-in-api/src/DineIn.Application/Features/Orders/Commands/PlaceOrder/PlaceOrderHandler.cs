using System.Globalization;
using DineIn.Application.DTOs;
using DineIn.Application.Interfaces;
using DineIn.Application.Mappings;
using DineIn.Domain.Entities;
using DineIn.Domain.Enums;
using DineIn.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Features.Orders.Commands.PlaceOrder;

public class PlaceOrderHandler(IApplicationDbContext dbContext) : IRequestHandler<PlaceOrderCommand, OrderDto>
{
    private const decimal TaxRate = 0.08m;
    private const decimal DeliveryFeeAmount = 4.99m;

    public async Task<OrderDto> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        var orderType = ParseOrderType(request.OrderType);
        var payment = ParsePayment(request.PaymentMethod, orderType);
        var nowUtc = DateTime.UtcNow;

        decimal subtotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var requestItem in request.Items)
        {
            if (!Guid.TryParse(requestItem.MenuItemId, out var menuItemId))
            {
                throw new NotFoundException("MenuItem", requestItem.MenuItemId);
            }

            var menuItem = await dbContext.MenuItems
                .Include(x => x.CustomizationGroups)
                .ThenInclude(x => x.Options)
                .FirstOrDefaultAsync(x => x.Id == menuItemId, cancellationToken);

            if (menuItem is null || !menuItem.IsAvailable)
            {
                throw new NotFoundException("MenuItem", requestItem.MenuItemId);
            }

            var selectedCustomizations = BuildSelectedCustomizations(menuItem, requestItem.SelectedCustomizations);
            var itemCustomizationTotal = selectedCustomizations.Sum(x => x.PriceAdjustment);
            var itemUnitPrice = menuItem.Price + itemCustomizationTotal;
            var itemTotal = itemUnitPrice * requestItem.Quantity;
            subtotal += itemTotal;

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = menuItem.Id,
                MenuItemName = menuItem.Name,
                MenuItemPrice = menuItem.Price,
                Quantity = requestItem.Quantity,
                SpecialInstructions = requestItem.SpecialInstructions,
                ItemTotal = itemTotal,
                SelectedCustomizations = selectedCustomizations
            };

            orderItems.Add(orderItem);
        }

        var tax = subtotal * TaxRate;
        var deliveryFee = orderType == OrderType.Delivery ? DeliveryFeeAmount : 0m;
        var total = subtotal + tax + deliveryFee;

        var estimatedTime = orderType switch
        {
            OrderType.Pickup => nowUtc.AddMinutes(20).ToString("h:mm tt", CultureInfo.InvariantCulture),
            OrderType.Delivery => nowUtc.AddMinutes(40).ToString("h:mm tt", CultureInfo.InvariantCulture),
            _ => null
        };

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderType = orderType,
            Status = OrderStatus.Confirmed,
            CreatedAt = nowUtc,
            TableNumber = request.TableNumber,
            CustomerName = request.CustomerName,
            PhoneNumber = request.PhoneNumber,
            Street = request.Street,
            City = request.City,
            Zip = request.Zip,
            EstimatedTime = estimatedTime,
            DeliveryFee = orderType == OrderType.Delivery ? deliveryFee : null,
            Subtotal = subtotal,
            Tax = tax,
            Total = total,
            PaymentMethod = payment.Method,
            PaymentStatus = payment.Status,
            Items = orderItems
        };

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return order.ToDto();
    }

    private static OrderType ParseOrderType(string orderType)
    {
        return orderType.Trim().ToLowerInvariant() switch
        {
            "dine-in" => OrderType.DineIn,
            "pickup" => OrderType.Pickup,
            "delivery" => OrderType.Delivery,
            _ => throw new ArgumentOutOfRangeException(nameof(orderType), "OrderType must be one of: dine-in, pickup, delivery")
        };
    }

    private static (PaymentMethod Method, PaymentStatus Status) ParsePayment(string? paymentMethod, OrderType orderType)
    {
        if (string.IsNullOrWhiteSpace(paymentMethod))
        {
            return (PaymentMethod.None, PaymentStatus.Unpaid);
        }

        if (paymentMethod.Equals("cashOnDelivery", StringComparison.OrdinalIgnoreCase))
        {
            if (orderType != OrderType.Delivery)
            {
                throw new ArgumentOutOfRangeException(nameof(paymentMethod), "cashOnDelivery is only valid for delivery orders");
            }

            return (PaymentMethod.CashOnDelivery, PaymentStatus.Unpaid);
        }

        if (paymentMethod.Equals("payAtCounter", StringComparison.OrdinalIgnoreCase))
        {
            if (orderType != OrderType.DineIn && orderType != OrderType.Pickup)
            {
                throw new ArgumentOutOfRangeException(nameof(paymentMethod), "payAtCounter is only valid for dine-in or pickup orders");
            }

            return (PaymentMethod.PayAtCounter, PaymentStatus.Unpaid);
        }

        throw new ArgumentOutOfRangeException(nameof(paymentMethod), "PaymentMethod must be one of: cashOnDelivery, payAtCounter, or omitted");
    }

    private static List<OrderItemCustomization> BuildSelectedCustomizations(
        MenuItem menuItem,
        Dictionary<string, List<string>> selectedCustomizationMap)
    {
        var customizations = new List<OrderItemCustomization>();

        foreach (var groupSelection in selectedCustomizationMap)
        {
            if (!Guid.TryParse(groupSelection.Key, out var groupId))
            {
                throw new NotFoundException("CustomizationGroup", groupSelection.Key);
            }

            var group = menuItem.CustomizationGroups.FirstOrDefault(x => x.Id == groupId);
            if (group is null)
            {
                throw new NotFoundException("CustomizationGroup", groupSelection.Key);
            }

            foreach (var optionIdValue in groupSelection.Value)
            {
                if (!Guid.TryParse(optionIdValue, out var optionId))
                {
                    throw new NotFoundException("CustomizationOption", optionIdValue);
                }

                var option = group.Options.FirstOrDefault(x => x.Id == optionId);
                if (option is null)
                {
                    throw new NotFoundException("CustomizationOption", optionIdValue);
                }

                customizations.Add(new OrderItemCustomization
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

        return customizations;
    }
}