namespace SolutionOrders.API.Features.OrderItems.Messages.DTOs
{
    // DTO - model pozycji zamówienia zwracany przez API
    public class OrderItemDto
    {
        public int IdOrderItem { get; set; }

        public int IdOrder { get; set; }

        public int IdItem { get; set; }
        public string? ItemName { get; set; }
        public string? ItemCode { get; set; }

        public decimal? Quantity { get; set; }

        // Cena produktu pobrana z tabeli Items
        public decimal ItemPrice { get; set; }

        // Wartość pozycji: ilość * cena produktu
        public decimal LineValue { get; set; }

        public bool IsActive { get; set; }
    }
}