using MediatR;

namespace SolutionOrders.API.Features.Orders.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonego zamówienia
    public class CreateOrderCommand : IRequest<int>
    {
        public DateTime? DataOrder { get; set; }
        public int? IdClient { get; set; }
        public int? IdWorker { get; set; }
        public string? Notes { get; set; }
        public DateTime? DeliveryDate { get; set; }
    }
}