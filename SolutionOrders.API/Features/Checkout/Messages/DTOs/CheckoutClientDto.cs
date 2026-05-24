namespace SolutionOrders.API.Features.Checkout.Messages.DTOs
{
    // DTO z danymi klienta podawanymi przy finalizacji koszyka
    public class CheckoutClientDto
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
    }
}