using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Items.Providers
{
    public class ItemProvider : IItemProvider
    {
        private readonly ApplicationDbContext _context;

        public ItemProvider(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Item>> GetAllItemsAsync(
            bool asNoTracking = true,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Items
                .Include(i => i.Category)
                .Include(i => i.UnitOfMeasurement)
                .Where(i => i.IsActive);

            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            return await query
                .OrderBy(i => i.Name)
                .ToListAsync(cancellationToken);
        }
    }
}