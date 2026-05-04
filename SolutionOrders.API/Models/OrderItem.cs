namespace SolutionOrders.API.Models
{
    public class OrderItem
    {
        public int IdOrderItem { get; set; }
        public int IdOrder { get; set; }
        public int IdItem { get; set; }
        public decimal? Quantity { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual Item Item { get; set; } = null!;
    }
}