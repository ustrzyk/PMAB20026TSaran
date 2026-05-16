using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Handlers.Commands
{
    public class DeleteUnitOfMeasurementCommandHandler(ApplicationDbContext context)
        : IRequestHandler<DeleteUnitOfMeasurementCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeleteUnitOfMeasurementCommand request,
            CancellationToken cancellationToken)
        {
            var unitOfMeasurement = await context.UnitOfMeasurements
                .FirstOrDefaultAsync(unit =>
                        unit.IdUnitOfMeasurement == request.IdUnitOfMeasurement &&
                        unit.IsActive,
                    cancellationToken);

            if (unitOfMeasurement == null)
            {
                throw new KeyNotFoundException(
                    $"Jednostka miary o ID {request.IdUnitOfMeasurement} nie istnieje");
            }

            var hasItems = await context.Items
                .AnyAsync(item =>
                        item.IdUnitOfMeasurement == request.IdUnitOfMeasurement &&
                        item.IsActive,
                    cancellationToken);

            if (hasItems)
            {
                throw new InvalidOperationException(
                    "Nie można usunąć jednostki miary, ponieważ są do niej przypisane produkty");
            }

            unitOfMeasurement.IsActive = false;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}