using SolutionOrders.API.Models;

namespace SolutionOrders.API.Features.Items.Providers
{
    public interface IItemProvider
    {
        /// <summary>
        /// Method to get all items from the database. The AsNoTracking parameter allows you to specify whether the entities should be tracked by the context or not. If set to true, the entities will not be tracked, which can improve performance when you only need to read data without making changes.
        /// </summary>
        /// <param name="AsNoTracking">Specifies whether the entities should be tracked by the context.</param>
        /// <param name="cancellationToken">A token to cancel the operation.</param>
        /// <returns>A collection of items.</returns>
        Task<IEnumerable<Item>> GetAllItemsAsync(bool AsNoTracking = true, CancellationToken cancellationToken = default);

        /// <summary>
        /// Asynchronously retrieves an item by its unique identifier.
        /// </summary>
        /// <remarks>Use this method when the item may not exist or when you want to control entity
        /// tracking behavior. If the item does not exist, the method returns <see langword="null"/>. Cancelling the
        /// provided token will abort the operation.</remarks>
        /// <param name="id">The unique identifier of the item to retrieve. Must be a positive integer.</param>
        /// <param name="asNoTracking">Indicates whether the item should be retrieved without tracking changes in the context. Specify <see
        /// langword="true"/> to disable change tracking; otherwise, <see langword="false"/>.</param>
        /// <param name="cancellationToken">A cancellation token that can be used to cancel the asynchronous operation.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the item if found; otherwise,
        /// <see langword="null"/>.</returns>
        Task<Item> GetItemByIdAsync(int id, bool asNoTracking = true, CancellationToken cancellationToken = default);
    }
}