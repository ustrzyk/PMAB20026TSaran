using Mapster;
using MediatR;
using SolutionOrders.API.Features.Items.Messages.Commands;
using SolutionOrders.API.Features.Items.Services;
using SolutionOrders.API.Models;

namespace SolutionOrders.API.Features.Items.Handlers.Commands
{
    public class CreateItemHandler(IItemService itemService, ILogger<CreateItemHandler> logger)
        : IRequestHandler<CreateItemCommand, int>
    {
        public async Task<int> Handle(CreateItemCommand request,CancellationToken cancellationToken)
        {
            logger.LogInformation("Tworzenie nowego produktu: {Name}", request.Name);
            var item = request.Adapt<Item>();
            await itemService.CreateItem(item, cancellationToken);
            logger.LogInformation("Utworzono produkt ID: {IdItem}", item.IdItem);
            // Zwracamy ID 
            return item.IdItem;
        }
    }
}