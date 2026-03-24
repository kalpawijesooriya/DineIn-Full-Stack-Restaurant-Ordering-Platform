using FluentValidation;

namespace DineIn.Application.Features.Payments.Commands.SimulatePayment;

public class SimulatePaymentValidator : AbstractValidator<SimulatePaymentCommand>
{
    public SimulatePaymentValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}