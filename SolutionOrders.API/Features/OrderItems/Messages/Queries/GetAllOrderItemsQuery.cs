using MediatR;
using SolutionOrders.API.Features.OrderItems.Messages.DTOs;

namespace SolutionOrders.API.Features.OrderItems.Messages.Queries
{
    public class GetAllOrderItemsQuery : IRequest<IEnumerable<OrderItemDto>>
    {
    }
}