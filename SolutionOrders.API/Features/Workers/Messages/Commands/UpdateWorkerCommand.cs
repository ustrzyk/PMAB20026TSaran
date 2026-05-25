using MediatR;

namespace SolutionOrders.API.Features.Workers.Messages.Commands
{
    public class UpdateWorkerCommand : IRequest<Unit>
    {
        public int IdWorker { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string Role { get; set; } = "Worker";
        public bool IsActive { get; set; }
    }
}