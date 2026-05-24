namespace SolutionOrders.API.Features.Checkout.Messages.DTOs
{
    // DTO dla jednej pozycji koszyka
    public class CheckoutItemDto
    {
        public int IdItem { get; set; }
        public decimal Quantity { get; set; }
    }
}