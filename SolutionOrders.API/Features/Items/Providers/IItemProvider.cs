using SolutionOrders.API.Models;

namespace SolutionOrders.API.Features.Items.Providers
{
    public interface IItemProvider
    {
        Task<IEnumerable<Item>> GetAllItemsAsync(
            bool asNoTracking = true,
            CancellationToken cancellationToken = default);
    }
}