namespace SolutionOrders.API.Features.Dashboard.Messages.DTOs
{
    // DTO dla raportu sprzedaży według kategorii produktów
    public class DashboardCategorySalesDto
    {
        public int IdCategory { get; set; }

        public string? CategoryName { get; set; }

        public decimal TotalQuantity { get; set; }

        public decimal TotalValue { get; set; }
    }
}