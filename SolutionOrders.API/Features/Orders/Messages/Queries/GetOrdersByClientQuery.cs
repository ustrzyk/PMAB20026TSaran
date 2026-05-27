using MediatR;
using SolutionOrders.API.Features.Orders.Messages.DTOs;

namespace SolutionOrders.API.Features.Orders.Messages.Queries
{
    public class GetOrdersByClientQuery(int idClient) : IRequest<IEnumerable<OrderDto>>
    {
        public int IdClient { get; } = idClient;
    }
}