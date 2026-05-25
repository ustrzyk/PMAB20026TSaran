namespace SolutionOrders.API.Features.Checkout.Messages.DTOs
{
    public class CheckoutClientDto
    {
        public int? IdClient { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
    }
}