namespace DineIn.Domain.Entities;

public class CustomizationOption
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }
    public Guid CustomizationGroupId { get; set; }

    public CustomizationGroup CustomizationGroup { get; set; } = null!;
}