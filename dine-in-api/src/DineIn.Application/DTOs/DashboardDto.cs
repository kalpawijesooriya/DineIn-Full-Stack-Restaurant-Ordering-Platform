namespace DineIn.Application.DTOs;

public record DashboardDto(
    int TotalOrdersToday,
    decimal RevenueToday,
    int ActiveOrders,
    int CompletedOrdersToday,
    decimal AverageOrderValue,
    Dictionary<string, int> OrdersByType,
    List<OrderDto> RecentOrders);
