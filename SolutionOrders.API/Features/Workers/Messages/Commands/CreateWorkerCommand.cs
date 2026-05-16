using MediatR;

namespace SolutionOrders.API.Features.Workers.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonego pracownika
    public class CreateWorkerCommand : IRequest<int>
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? Password { get; set; }
    }
}