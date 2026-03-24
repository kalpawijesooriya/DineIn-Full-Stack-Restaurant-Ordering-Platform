using FluentValidation;

namespace DineIn.Application.Features.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty();

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(x => x is "preparing" or "ready" or "completed")
            .WithMessage("Status must be one of: preparing, ready, completed");
    }
}