using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.OrderItems.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.OrderItems.Handlers.Commands
{
    public class DeleteOrderItemCommandHandler(ApplicationDbContext context)
        : IRequestHandler<DeleteOrderItemCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeleteOrderItemCommand request,
            CancellationToken cancellationToken)
        {
            var orderItem = await context.OrderItems
                .FirstOrDefaultAsync(orderItem =>
                        orderItem.IdOrderItem == request.IdOrderItem &&
                        orderItem.IsActive,
                    cancellationToken);

            if (orderItem == null)
            {
                throw new KeyNotFoundException(
                    $"Pozycja zamówienia o ID {request.IdOrderItem} nie istnieje");
            }

            orderItem.IsActive = false;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}