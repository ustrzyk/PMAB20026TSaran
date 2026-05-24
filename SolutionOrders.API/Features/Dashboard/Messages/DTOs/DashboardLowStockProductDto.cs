namespace SolutionOrders.API.Features.Dashboard.Messages.DTOs
{
    // DTO dla produktu z niskim stanem magazynowym
    public class DashboardLowStockProductDto
    {
        public int IdItem { get; set; }

        public string? Name { get; set; }
        public string? Code { get; set; }

        public decimal? Quantity { get; set; }

        public string? UnitName { get; set; }
        public string? CategoryName { get; set; }

        public decimal? Price { get; set; }
        public decimal StockValue { get; set; }
    }
}