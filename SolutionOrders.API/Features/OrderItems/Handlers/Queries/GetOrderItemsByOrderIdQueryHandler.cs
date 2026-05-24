using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.OrderItems.Messages.DTOs;
using SolutionOrders.API.Features.OrderItems.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.OrderItems.Handlers.Queries
{
    public class GetOrderItemsByOrderIdQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetOrderItemsByOrderIdQuery, IEnumerable<OrderItemDto>>
    {
        public async Task<IEnumerable<OrderItemDto>> Handle(
            GetOrderItemsByOrderIdQuery request,
            CancellationToken cancellationToken)
        {
            var orderItems = await context.OrderItems
                .AsNoTracking()
                .Include(orderItem => orderItem.Item)
                .Where(orderItem => orderItem.IdOrder == request.IdOrder)
                .OrderByDescending(orderItem => orderItem.IdOrderItem)
                .Select(orderItem => new OrderItemDto
                {
                    IdOrderItem = orderItem.IdOrderItem,
                    IdOrder = orderItem.IdOrder,

                    IdItem = orderItem.IdItem,
                    ItemName = orderItem.Item.Name,
                    ItemCode = orderItem.Item.Code,

                    Quantity = orderItem.Quantity,

                    ItemPrice = orderItem.Item.Price ?? 0,
                    LineValue = (orderItem.Quantity ?? 0) * (orderItem.Item.Price ?? 0),

                    IsActive = orderItem.IsActive
                })
                .ToListAsync(cancellationToken);

            return orderItems;
        }
    }
}