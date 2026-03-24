namespace DineIn.Application.DTOs;

public record RevenueReportDto(
    decimal TotalRevenue,
    int TotalOrders,
    decimal AverageOrderValue,
    List<DailyRevenueDto> DailyBreakdown,
    Dictionary<string, int> OrdersByType,
    Dictionary<string, int> OrdersByStatus);

public record DailyRevenueDto(string Date, decimal Revenue, int OrderCount);
