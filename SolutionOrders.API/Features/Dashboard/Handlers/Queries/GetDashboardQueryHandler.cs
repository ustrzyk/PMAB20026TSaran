using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Dashboard.Messages.DTOs;
using SolutionOrders.API.Features.Dashboard.Messages.Queries;
using SolutionOrders.API.Features.Orders.Helpers;
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
                .CountAsync(order => order.IsActive, cancellationToken);

            var newOrdersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(order =>
                    order.IsActive &&
                    (order.Status == null || order.Status == OrderStatusHelper.New),
                    cancellationToken);

            var inProgressOrdersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(order =>
                    order.IsActive &&
                    order.Status == OrderStatusHelper.InProgress,
                    cancellationToken);

            var readyOrdersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(order =>
                    order.IsActive &&
                    order.Status == OrderStatusHelper.Ready,
                    cancellationToken);

            var shippedOrdersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(order =>
                    order.IsActive &&
                    order.Status == OrderStatusHelper.Shipped,
                    cancellationToken);

            var completedOrdersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(order =>
                    order.IsActive &&
                    order.Status == OrderStatusHelper.Completed,
                    cancellationToken);

            var cancelledOrdersCount = await context.Orders
                .AsNoTracking()
                .CountAsync(order =>
                    order.IsActive &&
                    order.Status == OrderStatusHelper.Cancelled,
                    cancellationToken);

            var orderItemsCount = await context.OrderItems
                .AsNoTracking()
                .CountAsync(orderItem =>
                    orderItem.IsActive &&
                    orderItem.Order.IsActive,
                    cancellationToken);

            var productsStockValue = await context.Items
                .AsNoTracking()
                .Where(item => item.IsActive)
                .SumAsync(item =>
                    (item.Price ?? 0) * (item.Quantity ?? 0),
                    cancellationToken);

            var ordersTotalValue = await context.OrderItems
                .AsNoTracking()
                .Where(orderItem =>
                    orderItem.IsActive &&
                    orderItem.Order.IsActive)
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
                .Where(order => order.IsActive)
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

                    Status = order.Status ?? OrderStatusHelper.New,

                    OrderItemsCount = order.OrderItems
                        .Count(orderItem => orderItem.IsActive),

                    TotalValue = order.OrderItems
                        .Where(orderItem => orderItem.IsActive)
                        .Sum(orderItem =>
                            (orderItem.Quantity ?? 0) *
                            (orderItem.Item.Price ?? 0))
                })
                .ToListAsync(cancellationToken);

            var lowStockProducts = await context.Items
                .AsNoTracking()
                .Include(item => item.Category)
                .Include(item => item.UnitOfMeasurement)
                .Where(item =>
                    item.IsActive &&
                    (item.Quantity ?? 0) <= 5)
                .OrderBy(item => item.Quantity)
                .ThenBy(item => item.Name)
                .Take(10)
                .Select(item => new DashboardLowStockProductDto
                {
                    IdItem = item.IdItem,

                    Name = item.Name,
                    Code = item.Code,

                    Quantity = item.Quantity,

                    UnitName = item.UnitOfMeasurement != null
                        ? item.UnitOfMeasurement.Name
                        : null,

                    CategoryName = item.Category != null
                        ? item.Category.Name
                        : null,

                    Price = item.Price,
                    StockValue = (item.Price ?? 0) * (item.Quantity ?? 0)
                })
                .ToListAsync(cancellationToken);

            var categorySales = await context.OrderItems
                .AsNoTracking()
                .Where(orderItem =>
                    orderItem.IsActive &&
                    orderItem.Order.IsActive)
                .GroupBy(orderItem => new
                {
                    orderItem.Item.IdCategory,
                    CategoryName = orderItem.Item.Category != null
                        ? orderItem.Item.Category.Name
                        : "Brak kategorii"
                })
                .Select(group => new DashboardCategorySalesDto
                {
                    IdCategory = group.Key.IdCategory,
                    CategoryName = group.Key.CategoryName,

                    TotalQuantity = group.Sum(orderItem =>
                        orderItem.Quantity ?? 0),

                    TotalValue = group.Sum(orderItem =>
                        (orderItem.Quantity ?? 0) *
                        (orderItem.Item.Price ?? 0))
                })
                .OrderByDescending(category => category.TotalValue)
                .ToListAsync(cancellationToken);

            var topProducts = await context.OrderItems
                .AsNoTracking()
                .Where(orderItem =>
                    orderItem.IsActive &&
                    orderItem.Order.IsActive)
                .GroupBy(orderItem => new
                {
                    orderItem.Item.IdItem,
                    orderItem.Item.Name,
                    orderItem.Item.Code,
                    CategoryName = orderItem.Item.Category != null
                        ? orderItem.Item.Category.Name
                        : "Brak kategorii"
                })
                .Select(group => new DashboardTopProductDto
                {
                    IdItem = group.Key.IdItem,
                    Name = group.Key.Name,
                    Code = group.Key.Code,
                    CategoryName = group.Key.CategoryName,

                    TotalQuantity = group.Sum(orderItem =>
                        orderItem.Quantity ?? 0),

                    TotalValue = group.Sum(orderItem =>
                        (orderItem.Quantity ?? 0) *
                        (orderItem.Item.Price ?? 0))
                })
                .OrderByDescending(product => product.TotalValue)
                .Take(5)
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

                NewOrdersCount = newOrdersCount,
                InProgressOrdersCount = inProgressOrdersCount,
                ReadyOrdersCount = readyOrdersCount,
                ShippedOrdersCount = shippedOrdersCount,
                CompletedOrdersCount = completedOrdersCount,
                CancelledOrdersCount = cancelledOrdersCount,

                ProductsStockValue = productsStockValue,
                OrdersTotalValue = ordersTotalValue,

                LatestOrders = latestOrders,
                LowStockProducts = lowStockProducts,
                CategorySales = categorySales,
                TopProducts = topProducts
            };

            return dashboard;
        }
    }
}