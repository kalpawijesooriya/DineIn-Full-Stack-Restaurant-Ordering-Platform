using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DineIn.Infrastructure.Persistence.Configurations;

public class CustomizationOptionConfiguration : IEntityTypeConfiguration<CustomizationOption>
{
    public void Configure(EntityTypeBuilder<CustomizationOption> builder)
    {
        builder.ToTable("CustomizationOptions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(200);

        builder.Property(x => x.PriceAdjustment)
            .HasPrecision(10, 2);
    }
}
