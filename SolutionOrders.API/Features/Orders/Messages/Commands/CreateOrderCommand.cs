using MediatR;

namespace SolutionOrders.API.Features.Orders.Messages.Commands
{
    public class CreateOrderCommand : IRequest<int>
    {
        public DateTime? DataOrder { get; set; }
        public int? IdClient { get; set; }
        public int? IdWorker { get; set; }
        public string? Notes { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}