using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Orders.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Orders.Handlers.Commands
{
    public class UpdateOrderCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateOrderCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateOrderCommand request,
            CancellationToken cancellationToken)
        {
            if (request.IdClient == null || request.IdClient <= 0)
            {
                throw new ArgumentException("Klient jest wymagany");
            }

            if (request.IdWorker == null || request.IdWorker <= 0)
            {
                throw new ArgumentException("Pracownik jest wymagany");
            }

            var order = await context.Orders
                .FirstOrDefaultAsync(order =>
                    order.IdOrder == request.IdOrder,
                    cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    $"Zamówienie o ID {request.IdOrder} nie istnieje");
            }

            var clientExists = await context.Clients
                .AnyAsync(client =>
                    client.IdClient == request.IdClient,
                    cancellationToken);

            if (!clientExists)
            {
                throw new ArgumentException(
                    $"Klient o ID {request.IdClient} nie istnieje");
            }

            var workerExists = await context.Workers
                .AnyAsync(worker =>
                    worker.IdWorker == request.IdWorker,
                    cancellationToken);

            if (!workerExists)
            {
                throw new ArgumentException(
                    $"Pracownik o ID {request.IdWorker} nie istnieje");
            }

            order.DataOrder = request.DataOrder ?? order.DataOrder ?? DateTime.Now;
            order.IdClient = request.IdClient;
            order.IdWorker = request.IdWorker;
            order.Notes = request.Notes;
            order.DeliveryDate = request.DeliveryDate;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}