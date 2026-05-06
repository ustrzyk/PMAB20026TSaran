using MediatR;

namespace SolutionOrders.API.Features.Items.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonego rekordu
    public class CreateItemCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int IdCategory { get; set; }
        public decimal? Price { get; set; }
        public decimal? Quantity { get; set; }
        public string? FotoUrl { get; set; }
        public int? IdUnitOfMeasurement { get; set; }
        public string? Code { get; set; }
    }
}