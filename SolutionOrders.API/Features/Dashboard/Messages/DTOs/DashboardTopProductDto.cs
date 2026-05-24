namespace SolutionOrders.API.Features.Dashboard.Messages.DTOs
{
    // DTO dla raportu najlepiej sprzedających się produktów
    public class DashboardTopProductDto
    {
        public int IdItem { get; set; }

        public string? Name { get; set; }
        public string? Code { get; set; }

        public string? CategoryName { get; set; }

        public decimal TotalQuantity { get; set; }
        public decimal TotalValue { get; set; }
    }
}