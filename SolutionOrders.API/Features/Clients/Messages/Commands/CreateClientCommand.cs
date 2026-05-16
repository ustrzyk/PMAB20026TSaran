using MediatR;

namespace SolutionOrders.API.Features.Clients.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonego klienta
    public class CreateClientCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
    }
}