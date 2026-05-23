using MediatR;

namespace SolutionOrders.API.Features.OrderItems.Messages.Commands
{
    public class DeleteOrderItemCommand(int idOrderItem) : IRequest<Unit>
    {
        public int IdOrderItem { get; set; } = idOrderItem;
    }
}