namespace SolutionOrders.API.Features.Checkout.Messages.DTOs
{
    // DTO zwracany po poprawnym złożeniu zamówienia z koszyka
    public class CheckoutOrderResponseDto
    {
        public int IdOrder { get; set; }
        public int IdClient { get; set; }

        public decimal TotalValue { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}