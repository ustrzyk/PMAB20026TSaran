using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Items.Services
{
    public class ItemService(ApplicationDbContext context) : IItemService
    {
        public async Task CreateItem(
            Item item,
            CancellationToken cancellationToken)
        {
            // Dodanie nowego produktu do bazy
            context.Items.Add(item);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}