namespace SolutionOrders.API.Features.Orders.Messages.DTOs
{
    // DTO - model zamówienia zwracany przez API
    public class OrderDto
    {
        public int IdOrder { get; set; }
        public DateTime? DataOrder { get; set; }

        public int? IdClient { get; set; }
        public string? ClientName { get; set; }

        public int? IdWorker { get; set; }
        public string? WorkerName { get; set; }

        public string? Notes { get; set; }
        public DateTime? DeliveryDate { get; set; }

        public int OrderItemsCount { get; set; }

        // Suma wartości aktywnych pozycji zamówienia:
        // ilość * cena produktu
        public decimal TotalValue { get; set; }
    }
}