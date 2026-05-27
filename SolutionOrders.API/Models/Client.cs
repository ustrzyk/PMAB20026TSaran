namespace SolutionOrders.API.Models
{
    public class Client
    {
        public int IdClient { get; set; }
        public string? Name { get; set; }
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool IsActive { get; set; }

        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}