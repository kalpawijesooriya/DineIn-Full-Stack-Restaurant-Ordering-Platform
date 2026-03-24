namespace DineIn.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}