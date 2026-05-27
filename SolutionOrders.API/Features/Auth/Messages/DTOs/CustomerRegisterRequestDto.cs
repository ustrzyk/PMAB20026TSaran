namespace SolutionOrders.API.Features.Auth.Messages.DTOs
{
    public class CustomerRegisterRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
    }
}