using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Orders.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Orders.Handlers.Commands
{
    public class CreateOrderCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateOrderCommand, int>
    {
        public async Task<int> Handle(
            CreateOrderCommand request,
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

            var clientExists = await context.Clients
                .AnyAsync(client =>
                    client.IdClient == request.IdClient &&
                    client.IsActive,
                    cancellationToken);

            if (!clientExists)
            {
                throw new ArgumentException(
                    $"Klient o ID {request.IdClient} nie istnieje albo jest nieaktywny");
            }

            var workerExists = await context.Workers
                .AnyAsync(worker =>
                    worker.IdWorker == request.IdWorker &&
                    worker.IsActive,
                    cancellationToken);

            if (!workerExists)
            {
                throw new ArgumentException(
                    $"Pracownik o ID {request.IdWorker} nie istnieje albo jest nieaktywny");
            }

            var order = new Order
            {
                DataOrder = request.DataOrder ?? DateTime.Now,
                IdClient = request.IdClient,
                IdWorker = request.IdWorker,
                Notes = request.Notes,
                DeliveryDate = request.DeliveryDate,
                IsActive = request.IsActive
            };

            context.Orders.Add(order);

            await context.SaveChangesAsync(cancellationToken);

            return order.IdOrder;
        }
    }
}