namespace SolutionOrders.API.Features.Auth.Messages.DTOs
{
    public class WorkerLoginRequestDto
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}