namespace SolutionOrders.API.Features.Dashboard.Messages.DTOs
{
    // DTO - główne dane raportowe dla ekranu Dashboard
    public class DashboardDto
    {
        public int ProductsCount { get; set; }
        public int CategoriesCount { get; set; }
        public int UnitsCount { get; set; }

        public int ClientsCount { get; set; }
        public int WorkersCount { get; set; }

        public int OrdersCount { get; set; }
        public int OrderItemsCount { get; set; }

        public decimal ProductsStockValue { get; set; }
        public decimal OrdersTotalValue { get; set; }

        public IEnumerable<DashboardLatestOrderDto> LatestOrders { get; set; }
            = new List<DashboardLatestOrderDto>();
    }
}