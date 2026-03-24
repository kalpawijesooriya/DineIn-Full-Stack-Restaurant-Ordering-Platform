using DineIn.Application.DTOs;
using FluentValidation;

namespace DineIn.Application.Features.Orders.Commands.PlaceOrder;

public class PlaceOrderValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderValidator()
    {
        RuleFor(x => x.OrderType)
            .NotEmpty()
            .Must(x => x is "dine-in" or "pickup" or "delivery")
            .WithMessage("OrderType must be one of: dine-in, pickup, delivery");

        RuleFor(x => x.Items)
            .NotEmpty()
            .Must(x => x.Count > 0)
            .WithMessage("At least one item is required");

        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemRequestValidator());

        When(x => x.OrderType == "dine-in", () =>
        {
            RuleFor(x => x.TableNumber).NotEmpty();
        });

        When(x => x.OrderType == "pickup", () =>
        {
            RuleFor(x => x.CustomerName).NotEmpty();
            RuleFor(x => x.PhoneNumber).NotEmpty();
        });

        When(x => x.OrderType == "delivery", () =>
        {
            RuleFor(x => x.CustomerName).NotEmpty();
            RuleFor(x => x.PhoneNumber).NotEmpty();
            RuleFor(x => x.Street).NotEmpty();
            RuleFor(x => x.City).NotEmpty();
            RuleFor(x => x.Zip).NotEmpty();
        });

        RuleFor(x => x.PaymentMethod)
            .Must(value => string.IsNullOrWhiteSpace(value)
                || value.Equals("cashOnDelivery", StringComparison.OrdinalIgnoreCase)
                || value.Equals("payAtCounter", StringComparison.OrdinalIgnoreCase))
            .WithMessage("PaymentMethod must be one of: cashOnDelivery, payAtCounter, or omitted");
    }
}

public class CreateOrderItemRequestValidator : AbstractValidator<CreateOrderItemRequest>
{
    public CreateOrderItemRequestValidator()
    {
        RuleFor(x => x.MenuItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}