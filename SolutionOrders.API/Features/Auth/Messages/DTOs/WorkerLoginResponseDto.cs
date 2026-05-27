namespace SolutionOrders.API.Features.Auth.Messages.DTOs
{
    public class WorkerLoginResponseDto
    {
        public int IdWorker { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Login { get; set; } = string.Empty;
        public string Role { get; set; } = "Worker";
    }
}