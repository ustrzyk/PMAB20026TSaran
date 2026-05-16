using MediatR;

namespace SolutionOrders.API.Features.Clients.Messages.Commands
{
    public class UpdateClientCommand : IRequest<Unit>
    {
        public int IdClient { get; set; }
        public string? Name { get; set; }
        public string? Adress { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; }
    }
}