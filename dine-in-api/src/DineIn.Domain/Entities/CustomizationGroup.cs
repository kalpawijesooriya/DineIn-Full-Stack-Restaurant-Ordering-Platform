namespace DineIn.Domain.Entities;

public class CustomizationGroup
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Required { get; set; }
    public int MaxSelections { get; set; }
    public Guid MenuItemId { get; set; }

    public MenuItem MenuItem { get; set; } = null!;
    public ICollection<CustomizationOption> Options { get; set; } = new List<CustomizationOption>();
}