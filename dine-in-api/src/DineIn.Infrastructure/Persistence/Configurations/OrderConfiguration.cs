using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DineIn.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.TableNumber);
        builder.Property(x => x.CustomerName);
        builder.Property(x => x.PhoneNumber);
        builder.Property(x => x.EstimatedTime);
        builder.Property(x => x.Street);
        builder.Property(x => x.City);
        builder.Property(x => x.Zip);
        builder.Property(x => x.PaymentIntentId);

        builder.Property(x => x.DeliveryFee)
            .HasPrecision(10, 2);

        builder.Property(x => x.Subtotal)
            .HasPrecision(10, 2);

        builder.Property(x => x.Tax)
            .HasPrecision(10, 2);

        builder.Property(x => x.Total)
            .HasPrecision(10, 2);

        builder.HasMany(x => x.Items)
            .WithOne(x => x.Order)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
