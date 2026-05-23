using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.OrderItems.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.OrderItems.Handlers.Commands
{
    public class CreateOrderItemCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateOrderItemCommand, int>
    {
        public async Task<int> Handle(
            CreateOrderItemCommand request,
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

            var orderItem = new OrderItem
            {
                IdOrder = request.IdOrder,
                IdItem = request.IdItem,
                Quantity = request.Quantity,
                IsActive = true
            };

            context.OrderItems.Add(orderItem);

            await context.SaveChangesAsync(cancellationToken);

            return orderItem.IdOrderItem;
        }
    }
}