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

            if (!order.IsActive)
            {
                return Unit.Value;
            }

            order.IsActive = false;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}