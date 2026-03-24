using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DineIn.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<AdminUser> AdminUsers { get; }
    DbSet<Category> Categories { get; }
    DbSet<RestaurantSettings> RestaurantSettings { get; }
    DbSet<MenuItem> MenuItems { get; }
    DbSet<CustomizationGroup> CustomizationGroups { get; }
    DbSet<CustomizationOption> CustomizationOptions { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderItemCustomization> OrderItemCustomizations { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
