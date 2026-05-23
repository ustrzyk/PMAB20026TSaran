using MediatR;

namespace SolutionOrders.API.Features.OrderItems.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonej pozycji zamówienia
    public class CreateOrderItemCommand : IRequest<int>
    {
        public int IdOrder { get; set; }
        public int IdItem { get; set; }
        public decimal? Quantity { get; set; }
    }
}