namespace SolutionOrders.API.Features.Auth.Messages.DTOs
{
    public class CustomerLoginResponseDto
    {
        public int IdClient { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
    }
}