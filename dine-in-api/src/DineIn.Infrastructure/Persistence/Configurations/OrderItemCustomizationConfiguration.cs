using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DineIn.Infrastructure.Persistence.Configurations;

public class OrderItemCustomizationConfiguration : IEntityTypeConfiguration<OrderItemCustomization>
{
    public void Configure(EntityTypeBuilder<OrderItemCustomization> builder)
    {
        builder.ToTable("OrderItemCustomizations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PriceAdjustment)
            .HasPrecision(10, 2);

        builder.Property(x => x.CustomizationGroupName)
            .HasMaxLength(200);

        builder.Property(x => x.CustomizationOptionName)
            .HasMaxLength(200);
    }
}
