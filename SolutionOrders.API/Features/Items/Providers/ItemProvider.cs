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
            // Bazowe zapytanie o aktywne produkty
            var query = _context.Items
                .Include(i => i.Category)              // Dołączenie kategorii
                .Include(i => i.UnitOfMeasurement)     // Dołączenie jednostki miary
                .Where(i => i.IsActive);               // Tylko aktywne produkty

            // Wyłączenie śledzenia zmian dla samego odczytu
            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            // Sortowanie i wykonanie zapytania
            return await query
                .OrderBy(item => item.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Item> GetItemByIdAsync(
            int id,
            bool asNoTracking = true,
            CancellationToken cancellationToken = default)
        {
            // Bazowe zapytanie o aktywne produkty
            var query = _context.Items
                .Include(i => i.Category)              // Dołączenie kategorii
                .Include(i => i.UnitOfMeasurement)     // Dołączenie jednostki miary
                .Where(i => i.IsActive);               // Tylko aktywne produkty

            // Wyłączenie śledzenia zmian dla samego odczytu
            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            // Pobranie produktu po ID
            var item = await query
                .FirstOrDefaultAsync(
                    i => i.IdItem == id && i.IsActive,
                    cancellationToken);

            // Jeśli nie znaleziono produktu, zwracamy błąd
            return item ?? throw new KeyNotFoundException(
                $"Produkt o ID {id} nie istnieje");
        }
    }
}