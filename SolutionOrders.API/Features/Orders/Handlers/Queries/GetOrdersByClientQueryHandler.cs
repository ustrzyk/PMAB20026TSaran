using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Orders.Helpers;
using SolutionOrders.API.Features.Orders.Messages.DTOs;
using SolutionOrders.API.Features.Orders.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Orders.Handlers.Queries
{
    public class GetOrdersByClientQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetOrdersByClientQuery, IEnumerable<OrderDto>>
    {
        public async Task<IEnumerable<OrderDto>> Handle(
            GetOrdersByClientQuery request,
            CancellationToken cancellationToken)
        {
            if (request.IdClient <= 0)
            {
                throw new ArgumentException("ID klienta jest niepoprawne");
            }

            var orders = await context.Orders
                .AsNoTracking()
                .Include(order => order.Client)
                .Include(order => order.Worker)
                .Include(order => order.OrderItems)
                .ThenInclude(orderItem => orderItem.Item)
                .Where(order =>
                    order.IdClient == request.IdClient &&
                    order.IsActive)
                .OrderByDescending(order => order.DataOrder)
                .Select(order => new OrderDto
                {
                    IdOrder = order.IdOrder,
                    DataOrder = order.DataOrder,

                    IdClient = order.IdClient,
                    ClientName = order.Client != null ? order.Client.Name : null,

                    IdWorker = order.IdWorker,
                    WorkerName = order.Worker != null
                        ? $"{order.Worker.FirstName} {order.Worker.LastName}"
                        : null,

                    Notes = order.Notes,
                    DeliveryDate = order.DeliveryDate,
                    Status = order.Status ?? OrderStatusHelper.New,

                    OrderItemsCount = order.OrderItems.Count(orderItem => orderItem.IsActive),

                    TotalValue = order.OrderItems
                        .Where(orderItem => orderItem.IsActive)
                        .Sum(orderItem =>
                            (orderItem.Quantity ?? 0) *
                            (orderItem.Item.Price ?? 0)),

                    IsActive = order.IsActive
                })
                .ToListAsync(cancellationToken);

            return orders;
        }
    }
}