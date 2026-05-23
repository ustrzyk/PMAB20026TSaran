using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.OrderItems.Messages.DTOs;
using SolutionOrders.API.Features.OrderItems.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.OrderItems.Handlers.Queries
{
    public class GetAllOrderItemsQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetAllOrderItemsQuery, IEnumerable<OrderItemDto>>
    {
        public async Task<IEnumerable<OrderItemDto>> Handle(
            GetAllOrderItemsQuery request,
            CancellationToken cancellationToken)
        {
            var orderItems = await context.OrderItems
                .AsNoTracking()
                .Include(orderItem => orderItem.Item)
                .Where(orderItem => orderItem.IsActive)
                .OrderByDescending(orderItem => orderItem.IdOrderItem)
                .Select(orderItem => new OrderItemDto
                {
                    IdOrderItem = orderItem.IdOrderItem,
                    IdOrder = orderItem.IdOrder,

                    IdItem = orderItem.IdItem,
                    ItemName = orderItem.Item.Name,
                    ItemCode = orderItem.Item.Code,

                    Quantity = orderItem.Quantity,
                    IsActive = orderItem.IsActive
                })
                .ToListAsync(cancellationToken);

            return orderItems;
        }
    }
}