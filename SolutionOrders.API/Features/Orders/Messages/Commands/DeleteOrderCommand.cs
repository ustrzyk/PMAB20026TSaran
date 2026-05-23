using MediatR;

namespace SolutionOrders.API.Features.Orders.Messages.Commands
{
    public class DeleteOrderCommand(int idOrder) : IRequest<Unit>
    {
        public int IdOrder { get; set; } = idOrder;
    }
}