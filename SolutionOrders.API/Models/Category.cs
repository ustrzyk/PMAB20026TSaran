namespace SolutionOrders.API.Models
{
    public class Category
    {
        public int IdCategory { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }

        // Navigation property
        public virtual ICollection<Item> Items { get; set; } = new List<Item>();
    }
}