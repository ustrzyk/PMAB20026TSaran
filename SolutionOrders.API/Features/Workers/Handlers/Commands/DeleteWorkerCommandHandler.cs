using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Workers.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Workers.Handlers.Commands
{
    public class DeleteWorkerCommandHandler(ApplicationDbContext context)
        : IRequestHandler<DeleteWorkerCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeleteWorkerCommand request,
            CancellationToken cancellationToken)
        {
            var worker = await context.Workers
                .FirstOrDefaultAsync(worker =>
                        worker.IdWorker == request.IdWorker,
                    cancellationToken);

            if (worker == null)
            {
                throw new KeyNotFoundException(
                    $"Pracownik o ID {request.IdWorker} nie istnieje");
            }

            if (!worker.IsActive)
            {
                return Unit.Value;
            }

            var hasOrders = await context.Orders
                .AnyAsync(order =>
                        order.IdWorker == request.IdWorker,
                    cancellationToken);

            if (hasOrders)
            {
                throw new InvalidOperationException(
                    "Nie można usunąć pracownika, ponieważ ma przypisane zamówienia");
            }

            worker.IsActive = false;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}