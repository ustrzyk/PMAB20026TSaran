using MediatR;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.DTOs;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Messages.Queries
{
    public class GetAllUnitOfMeasurementsQuery : IRequest<IEnumerable<UnitOfMeasurementDto>>
    {
    }
}