using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DineIn.Infrastructure.Persistence.Configurations;

public class CustomizationGroupConfiguration : IEntityTypeConfiguration<CustomizationGroup>
{
    public void Configure(EntityTypeBuilder<CustomizationGroup> builder)
    {
        builder.ToTable("CustomizationGroups");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(200);

        builder.Property(x => x.MaxSelections)
            .HasDefaultValue(1);

        builder.HasMany(x => x.Options)
            .WithOne(x => x.CustomizationGroup)
            .HasForeignKey(x => x.CustomizationGroupId);
    }
}
