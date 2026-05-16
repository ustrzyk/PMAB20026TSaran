using MediatR;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Messages.Commands
{
    public class DeleteUnitOfMeasurementCommand(int idUnitOfMeasurement) : IRequest<Unit>
    {
        public int IdUnitOfMeasurement { get; set; } = idUnitOfMeasurement;
    }
}