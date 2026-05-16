using MediatR;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.UnitOfMeasurements.Handlers.Commands
{
    public class CreateUnitOfMeasurementCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateUnitOfMeasurementCommand, int>
    {
        public async Task<int> Handle(
            CreateUnitOfMeasurementCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa jednostki miary jest wymagana");
            }

            var unitOfMeasurement = new UnitOfMeasurement
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = true
            };

            context.UnitOfMeasurements.Add(unitOfMeasurement);

            await context.SaveChangesAsync(cancellationToken);

            return unitOfMeasurement.IdUnitOfMeasurement;
        }
    }
}