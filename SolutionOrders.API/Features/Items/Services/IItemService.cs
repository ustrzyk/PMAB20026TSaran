using SolutionOrders.API.Models;

namespace SolutionOrders.API.Features.Items.Services
{
    public interface IItemService
    {
        Task CreateItem(Item item,CancellationToken cancellationToken);
        Task UpgradeItem(Item item,CancellationToken cancellationToken);
    }
}
