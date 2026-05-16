namespace SolutionOrders.API.Features.Clients.Messages.DTOs
{
    // DTO - model klienta zwracany przez API
    public class ClientDto
    {
        public int IdClient { get; set; }
        public string? Name { get; set; }
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; }
    }
}