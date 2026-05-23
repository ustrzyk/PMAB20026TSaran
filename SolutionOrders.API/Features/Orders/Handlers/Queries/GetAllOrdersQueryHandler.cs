using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Orders.Messages.DTOs;
using SolutionOrders.API.Features.Orders.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Orders.Handlers.Queries
{
    public class GetAllOrdersQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetAllOrdersQuery, IEnumerable<OrderDto>>
    {
        public async Task<IEnumerable<OrderDto>> Handle(
            GetAllOrdersQuery request,
            CancellationToken cancellationToken)
        {
            var orders = await context.Orders
                .AsNoTracking()
                .Include(order => order.Client)
                .Include(order => order.Worker)
                .Include(order => order.OrderItems)
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

                    OrderItemsCount = order.OrderItems.Count(orderItem => orderItem.IsActive)
                })
                .ToListAsync(cancellationToken);

            return orders;
        }
    }
}