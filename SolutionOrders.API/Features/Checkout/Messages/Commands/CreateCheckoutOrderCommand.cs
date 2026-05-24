using MediatR;
using SolutionOrders.API.Features.Checkout.Messages.DTOs;

namespace SolutionOrders.API.Features.Checkout.Messages.Commands
{
    // Command do finalizacji koszyka i utworzenia zamówienia
    public class CreateCheckoutOrderCommand : IRequest<CheckoutOrderResponseDto>
    {
        public CheckoutClientDto Client { get; set; } = new CheckoutClientDto();

        public List<CheckoutItemDto> Items { get; set; } = new List<CheckoutItemDto>();

        public string? Notes { get; set; }
        public DateTime? DeliveryDate { get; set; }
    }
}