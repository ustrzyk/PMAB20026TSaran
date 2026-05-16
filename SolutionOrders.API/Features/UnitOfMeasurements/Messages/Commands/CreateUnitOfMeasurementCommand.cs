using MediatR;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonej jednostki miary
    public class CreateUnitOfMeasurementCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}