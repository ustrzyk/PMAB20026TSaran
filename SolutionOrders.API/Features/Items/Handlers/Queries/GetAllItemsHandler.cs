using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Items.Messages.DTOs;
using SolutionOrders.API.Features.Items.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Items.Handlers.Queries
{
    public class GetAllItemsHandler : IRequestHandler<GetAllItemsQuery, IEnumerable<ItemDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetAllItemsHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ItemDto>> Handle(
            GetAllItemsQuery request,
            CancellationToken cancellationToken)
        {
            // Query do bazy z Include (EAGER LOADING)
            var items = await _context.Items
                .AsNoTracking()                     //tylko do odczytu,przyspieszcz
                .Include(i => i.Category)              // JOIN z Category
                .Include(i => i.UnitOfMeasurement)     // JOIN z UnitOfMeasurement
                .Where(i => i.IsActive)                // Tylko aktywne
                .OrderBy(i => i.Name)                  // Sortowanie
                .Select(i => new ItemDto               // Projekcja do DTO
                {
                    IdItem = i.IdItem,
                    Name = i.Name,
                    Description = i.Description,
                    IdCategory = i.IdCategory,
                    CategoryName = i.Category.Name,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    IdUnitOfMeasurement = i.IdUnitOfMeasurement,
                    UnitName = i.UnitOfMeasurement != null
                        ? i.UnitOfMeasurement.Name
                        : null,
                    Code = i.Code,
                    IsActive = i.IsActive
                })
                .ToListAsync(cancellationToken);

            return items;
        }
    }
}
