namespace SolutionOrders.API.Models
{
    public class UnitOfMeasurement
    {
        public int IdUnitOfMeasurement { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }

        // Navigation property
        public virtual ICollection<Item> Items { get; set; } = new List<Item>();
    }
}