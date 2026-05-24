using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.DTOs;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Handlers.Queries
{
    public class GetUnitOfMeasurementByIdQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetUnitOfMeasurementByIdQuery, UnitOfMeasurementDto?>
    {
        public async Task<UnitOfMeasurementDto?> Handle(
            GetUnitOfMeasurementByIdQuery request,
            CancellationToken cancellationToken)
        {
            var unit = await context.UnitOfMeasurements
                .AsNoTracking()
                .Where(unit => unit.IdUnitOfMeasurement == request.Id)
                .Select(unit => new UnitOfMeasurementDto
                {
                    IdUnitOfMeasurement = unit.IdUnitOfMeasurement,
                    Name = unit.Name,
                    Shortcut = unit.Name,
                    Description = unit.Description,
                    IsActive = unit.IsActive
                })
                .FirstOrDefaultAsync(cancellationToken);

            return unit;
        }
    }
}