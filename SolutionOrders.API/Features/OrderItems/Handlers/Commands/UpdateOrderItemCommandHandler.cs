using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.OrderItems.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.OrderItems.Handlers.Commands
{
    public class UpdateOrderItemCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateOrderItemCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateOrderItemCommand request,
            CancellationToken cancellationToken)
        {
            if (request.IdOrder <= 0)
            {
                throw new ArgumentException("Zamówienie jest wymagane");
            }

            if (request.IdItem <= 0)
            {
                throw new ArgumentException("Produkt jest wymagany");
            }

            if (request.Quantity == null || request.Quantity <= 0)
            {
                throw new ArgumentException("Ilość musi być większa od 0");
            }

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

            var orderExists = await context.Orders
                .AnyAsync(order =>
                    order.IdOrder == request.IdOrder,
                    cancellationToken);

            if (!orderExists)
            {
                throw new ArgumentException(
                    $"Zamówienie o ID {request.IdOrder} nie istnieje");
            }

            var itemExists = await context.Items
                .AnyAsync(item =>
                    item.IdItem == request.IdItem &&
                    item.IsActive,
                    cancellationToken);

            if (!itemExists)
            {
                throw new ArgumentException(
                    $"Produkt o ID {request.IdItem} nie istnieje albo jest nieaktywny");
            }

            orderItem.IdOrder = request.IdOrder;
            orderItem.IdItem = request.IdItem;
            orderItem.Quantity = request.Quantity;
            orderItem.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}