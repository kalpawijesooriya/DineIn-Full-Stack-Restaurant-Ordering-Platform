using DineIn.Application.DTOs;
using MediatR;

namespace DineIn.Application.Features.Payments.Commands.SimulatePayment;

public record SimulatePaymentCommand(string OrderId, decimal Amount) : IRequest<PaymentSimulationDto>;