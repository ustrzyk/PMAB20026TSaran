using MediatR;
using SolutionOrders.API.Features.Orders.Messages.DTOs;

namespace SolutionOrders.API.Features.Orders.Messages.Queries
{
    public class GetOrderByIdQuery : IRequest<OrderDto?>
    {
        public int Id { get; set; }

        public GetOrderByIdQuery(int id)
        {
            Id = id;
        }
    }
}