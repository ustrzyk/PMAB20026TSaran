using Mapster;
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
            var items = await _context.Items
                .AsNoTracking()
                .Where(i => i.IsActive)
                .OrderBy(i => i.Name)
                .ProjectToType<ItemDto>()
                .ToListAsync(cancellationToken);

            return items;
        }
    }
}
