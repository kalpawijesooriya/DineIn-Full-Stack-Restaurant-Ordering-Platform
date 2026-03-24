namespace DineIn.Domain.Entities;

public class CustomizationOptionTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }
    public Guid CustomizationGroupTemplateId { get; set; }
    public CustomizationGroupTemplate CustomizationGroupTemplate { get; set; } = null!;
}