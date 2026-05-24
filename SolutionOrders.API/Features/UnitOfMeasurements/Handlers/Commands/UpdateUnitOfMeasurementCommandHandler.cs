using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Handlers.Commands
{
    public class UpdateUnitOfMeasurementCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateUnitOfMeasurementCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateUnitOfMeasurementCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa jednostki miary jest wymagana");
            }

            var unitOfMeasurement = await context.UnitOfMeasurements
                .FirstOrDefaultAsync(unit =>
                        unit.IdUnitOfMeasurement == request.IdUnitOfMeasurement,
                    cancellationToken);

            if (unitOfMeasurement == null)
            {
                throw new KeyNotFoundException(
                    $"Jednostka miary o ID {request.IdUnitOfMeasurement} nie istnieje");
            }

            unitOfMeasurement.Name = request.Name;
            unitOfMeasurement.Description = request.Description;
            unitOfMeasurement.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}