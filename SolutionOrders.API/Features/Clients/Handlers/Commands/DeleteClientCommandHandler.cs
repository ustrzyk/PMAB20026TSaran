using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Clients.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Commands
{
    public class DeleteClientCommandHandler(ApplicationDbContext context)
        : IRequestHandler<DeleteClientCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeleteClientCommand request,
            CancellationToken cancellationToken)
        {
            var client = await context.Clients
                .FirstOrDefaultAsync(client =>
                        client.IdClient == request.IdClient,
                    cancellationToken);

            if (client == null)
            {
                throw new KeyNotFoundException(
                    $"Klient o ID {request.IdClient} nie istnieje");
            }

            if (!client.IsActive)
            {
                return Unit.Value;
            }

            var hasOrders = await context.Orders
                .AnyAsync(order =>
                        order.IdClient == request.IdClient,
                    cancellationToken);

            if (hasOrders)
            {
                throw new InvalidOperationException(
                    "Nie można usunąć klienta, ponieważ ma przypisane zamówienia");
            }

            client.IsActive = false;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}