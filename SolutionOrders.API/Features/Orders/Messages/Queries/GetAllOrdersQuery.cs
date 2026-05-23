using MediatR;
using SolutionOrders.API.Features.Orders.Messages.DTOs;

namespace SolutionOrders.API.Features.Orders.Messages.Queries
{
    public class GetAllOrdersQuery : IRequest<IEnumerable<OrderDto>>
    {
    }
}