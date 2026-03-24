using System.Text.Json.Serialization;

namespace DineIn.Application.DTOs;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(DineInDetailsDto), "dine-in")]
[JsonDerivedType(typeof(PickupDetailsDto), "pickup")]
[JsonDerivedType(typeof(DeliveryDetailsDto), "delivery")]
public abstract record OrderTypeDetailsDto;

public record DineInDetailsDto(string TableNumber) : OrderTypeDetailsDto;

public record PickupDetailsDto(string CustomerName, string PhoneNumber, string EstimatedPickupTime) : OrderTypeDetailsDto;

public record DeliveryDetailsDto(
    string CustomerName,
    string PhoneNumber,
    AddressDto Address,
    decimal DeliveryFee,
    string EstimatedDeliveryTime) : OrderTypeDetailsDto;

public record AddressDto(string Street, string City, string Zip);
