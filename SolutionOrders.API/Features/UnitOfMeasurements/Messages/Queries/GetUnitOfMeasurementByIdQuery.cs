using MediatR;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.DTOs;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Messages.Queries
{
    // Query z parametrem Id
    public class GetUnitOfMeasurementByIdQuery : IRequest<UnitOfMeasurementDto?>
    {
        public int Id { get; set; }

        public GetUnitOfMeasurementByIdQuery(int id)
        {
            Id = id;
        }
    }
}