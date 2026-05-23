using MediatR;
using SolutionOrders.API.Features.OrderItems.Messages.DTOs;

namespace SolutionOrders.API.Features.OrderItems.Messages.Queries
{
    public class GetOrderItemByIdQuery : IRequest<OrderItemDto?>
    {
        public int Id { get; set; }

        public GetOrderItemByIdQuery(int id)
        {
            Id = id;
        }
    }
}