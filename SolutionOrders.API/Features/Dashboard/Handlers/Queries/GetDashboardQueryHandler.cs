using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Dashboard.Messages.DTOs;
using SolutionOrders.API.Features.Dashboard.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Dashboard.Handlers.Queries
{
    public class GetDashboardQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetDashboardQuery, DashboardDto>
    {
        public async Task<DashboardDto> Handle(
            GetDashboardQuery request,
            CancellationToken cancellationToken)
        {
            var productsCount = await context.Items
                .AsNoTracking()
                .CountAsync(item => item.IsActive, cancellationToken);

            var categoriesCount = await context.Categories
                .AsNoTracking()
                .CountAsync(category => category.IsActive, cancellationToken);

            var unitsCount = await context.UnitOfMeasurements
                .AsNoTracking()
                .CountAsync(unit => unit.IsActive, cancellationToken);

            var clientsCount = await context.Clients
                .AsNoTracking()
                .CountAsync(client => client.IsActive, cancellationToken);

            var workersCount = await context.Workers
                .AsNoTracking()
                .CountAsync(worker => worker.IsActive, cancellationToken);

            var ordersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(cancellationToken);

            var orderItemsCount = await context.OrderItems
                .AsNoTracking()
                .CountAsync(orderItem => orderItem.IsActive, cancellationToken);

            var productsStockValue = await context.Items
                .AsNoTracking()
                .Where(item => item.IsActive)
                .SumAsync(item =>
                    (item.Price ?? 0) * (item.Quantity ?? 0),
                    cancellationToken);

            var ordersTotalValue = await context.OrderItems
                .AsNoTracking()
                .Where(orderItem => orderItem.IsActive)
                .SumAsync(orderItem =>
                    (orderItem.Quantity ?? 0) *
                    (orderItem.Item.Price ?? 0),
                    cancellationToken);

            var latestOrders = await context.Orders
                .AsNoTracking()
                .Include(order => order.Client)
                .Include(order => order.Worker)
                .Include(order => order.OrderItems)
                    .ThenInclude(orderItem => orderItem.Item)
                .OrderByDescending(order => order.DataOrder)
                .Take(5)
                .Select(order => new DashboardLatestOrderDto
                {
                    IdOrder = order.IdOrder,
                    DataOrder = order.DataOrder,

                    ClientName = order.Client != null ? order.Client.Name : null,

                    WorkerName = order.Worker != null
                        ? $"{order.Worker.FirstName} {order.Worker.LastName}"
                        : null,

                    OrderItemsCount = order.OrderItems
                        .Count(orderItem => orderItem.IsActive),

                    TotalValue = order.OrderItems
                        .Where(orderItem => orderItem.IsActive)
                        .Sum(orderItem =>
                            (orderItem.Quantity ?? 0) *
                            (orderItem.Item.Price ?? 0))
                })
                .ToListAsync(cancellationToken);

            var dashboard = new DashboardDto
            {
                ProductsCount = productsCount,
                CategoriesCount = categoriesCount,
                UnitsCount = unitsCount,

                ClientsCount = clientsCount,
                WorkersCount = workersCount,

                OrdersCount = ordersCount,
                OrderItemsCount = orderItemsCount,

                ProductsStockValue = productsStockValue,
                OrdersTotalValue = ordersTotalValue,

                LatestOrders = latestOrders
            };

            return dashboard;
        }
    }
}