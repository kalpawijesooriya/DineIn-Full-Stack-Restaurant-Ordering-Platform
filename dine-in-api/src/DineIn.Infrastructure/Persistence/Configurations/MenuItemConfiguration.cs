using DineIn.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DineIn.Infrastructure.Persistence.Configurations;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.ToTable("MenuItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.Price)
            .HasPrecision(10, 2);

        builder.Property(x => x.ImageUrl)
            .HasMaxLength(500);

        builder.HasIndex(x => x.CategoryId);

        builder.HasMany(x => x.CustomizationGroups)
            .WithOne(x => x.MenuItem)
            .HasForeignKey(x => x.MenuItemId);
    }
}
