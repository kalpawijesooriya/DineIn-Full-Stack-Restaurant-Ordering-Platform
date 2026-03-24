namespace DineIn.Application.DTOs;

public record PaymentSimulationDto(bool Success, string PaymentIntentId, string Message);
