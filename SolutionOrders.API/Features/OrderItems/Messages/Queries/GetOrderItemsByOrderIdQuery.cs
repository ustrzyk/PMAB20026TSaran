using MediatR;
using SolutionOrders.API.Features.OrderItems.Messages.DTOs;

namespace SolutionOrders.API.Features.OrderItems.Messages.Queries
{
    public class GetOrderItemsByOrderIdQuery : IRequest<IEnumerable<OrderItemDto>>
    {
        public int IdOrder { get; set; }

        public GetOrderItemsByOrderIdQuery(int idOrder)
        {
            IdOrder = idOrder;
        }
    }
}