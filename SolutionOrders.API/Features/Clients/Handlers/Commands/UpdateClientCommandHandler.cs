using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Clients.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Commands
{
    public class UpdateClientCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateClientCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateClientCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa klienta jest wymagana");
            }

            var client = await context.Clients
                .FirstOrDefaultAsync(client =>
                        client.IdClient == request.IdClient,
                    cancellationToken);

            if (client == null)
            {
                throw new KeyNotFoundException(
                    $"Klient o ID {request.IdClient} nie istnieje");
            }

            client.Name = request.Name;
            client.Adress = request.Adress;
            client.PhoneNumber = request.PhoneNumber;
            client.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}