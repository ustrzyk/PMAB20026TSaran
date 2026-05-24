using MediatR;
using SolutionOrders.API.Features.Clients.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Commands
{
    public class CreateClientCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateClientCommand, int>
    {
        public async Task<int> Handle(
            CreateClientCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa klienta jest wymagana");
            }

            var client = new Client
            {
                Name = request.Name,
                Adress = request.Adress,
                PhoneNumber = request.PhoneNumber,
                IsActive = request.IsActive
            };

            context.Clients.Add(client);

            await context.SaveChangesAsync(cancellationToken);

            return client.IdClient;
        }
    }
}