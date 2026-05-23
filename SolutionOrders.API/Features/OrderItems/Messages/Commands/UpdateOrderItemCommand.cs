using MediatR;

namespace SolutionOrders.API.Features.OrderItems.Messages.Commands
{
    public class UpdateOrderItemCommand : IRequest<Unit>
    {
        public int IdOrderItem { get; set; }
        public int IdOrder { get; set; }
        public int IdItem { get; set; }
        public decimal? Quantity { get; set; }
        public bool IsActive { get; set; }
    }
}