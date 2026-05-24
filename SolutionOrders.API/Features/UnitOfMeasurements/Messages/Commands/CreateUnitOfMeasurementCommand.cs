using MediatR;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Messages.Commands
{
    public class CreateUnitOfMeasurementCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}