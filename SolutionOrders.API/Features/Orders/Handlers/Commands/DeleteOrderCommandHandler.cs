using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Orders.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Orders.Handlers.Commands
{
    public class DeleteOrderCommandHandler(ApplicationDbContext context)
        : IRequestHandler<DeleteOrderCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeleteOrderCommand request,
            CancellationToken cancellationToken)
        {
            var order = await context.Orders
                .FirstOrDefaultAsync(order =>
                        order.IdOrder == request.IdOrder,
                    cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    $"Zamówienie o ID {request.IdOrder} nie istnieje");
            }

            var hasActiveOrderItems = await context.OrderItems
                .AnyAsync(orderItem =>
                        orderItem.IdOrder == request.IdOrder &&
                        orderItem.IsActive,
                    cancellationToken);

            if (hasActiveOrderItems)
            {
                throw new InvalidOperationException(
                    "Nie można usunąć zamówienia, ponieważ ma przypisane pozycje");
            }

            context.Orders.Remove(order);

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}