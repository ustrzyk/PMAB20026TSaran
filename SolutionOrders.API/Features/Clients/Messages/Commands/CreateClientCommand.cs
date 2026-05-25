using MediatR;

namespace SolutionOrders.API.Features.Clients.Messages.Commands
{
    public class CreateClientCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool IsActive { get; set; } = true;
    }
}