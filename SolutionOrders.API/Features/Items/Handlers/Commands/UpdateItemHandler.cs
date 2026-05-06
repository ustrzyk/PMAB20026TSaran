using Mapster;
using MediatR;
using SolutionOrders.API.Features.Items.Messages.Commands;
using SolutionOrders.API.Features.Items.Providers;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Items.Handlers.Commands
{
    public class UpdateItemHandler(
        IItemProvider itemProvider,
        ApplicationDbContext context,
        ILogger<UpdateItemHandler> logger)
        : IRequestHandler<UpdateItemCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateItemCommand request,
            CancellationToken cancellationToken)
        {
            // Pobranie produktu z bazy do edycji
            var item = await itemProvider.GetItemByIdAsync(request.IdItem, asNoTracking: false, cancellationToken);
            logger.LogInformation("Aktualizacja produktu ID: {IdItem}", request.IdItem);
            request.Adapt(item);
            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Zaktualizowano produkt ID: {IdItem}", request.IdItem);

            return Unit.Value; // MediatR Unit = void
        }
    }
}