namespace SolutionOrders.API.Models
{
    public class Worker
    {
        public int IdWorker { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool IsActive { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string Role { get; set; } = "Worker";

        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}