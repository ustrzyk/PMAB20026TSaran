using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.DTOs;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Handlers.Queries
{
    public class GetAllUnitOfMeasurementsQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetAllUnitOfMeasurementsQuery, IEnumerable<UnitOfMeasurementDto>>
    {
        public async Task<IEnumerable<UnitOfMeasurementDto>> Handle(
            GetAllUnitOfMeasurementsQuery request,
            CancellationToken cancellationToken)
        {
            var units = await context.UnitOfMeasurements
                .AsNoTracking()
                .Where(unit => unit.IsActive)
                .OrderBy(unit => unit.Name)
                .Select(unit => new UnitOfMeasurementDto
                {
                    IdUnitOfMeasurement = unit.IdUnitOfMeasurement,
                    Name = unit.Name,
                    Shortcut = unit.Name,
                    Description = unit.Description,
                    IsActive = unit.IsActive
                })
                .ToListAsync(cancellationToken);

            return units;
        }
    }
}