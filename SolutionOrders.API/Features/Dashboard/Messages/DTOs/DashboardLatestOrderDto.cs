namespace SolutionOrders.API.Features.Dashboard.Messages.DTOs
{
    // DTO dla najnowszego zamówienia pokazywanego na Dashboardzie
    public class DashboardLatestOrderDto
    {
        public int IdOrder { get; set; }
        public DateTime? DataOrder { get; set; }

        public string? ClientName { get; set; }
        public string? WorkerName { get; set; }

        public string Status { get; set; } = "Nowe";

        public int OrderItemsCount { get; set; }
        public decimal TotalValue { get; set; }
    }
}