using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Categories.Messages.DTOs;
using SolutionOrders.API.Features.Categories.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Categories.Handlers.Queries
{
    public class GetAllCategoriesQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
    {
        public async Task<IEnumerable<CategoryDto>> Handle(
            GetAllCategoriesQuery request,
            CancellationToken cancellationToken)
        {
           var categories = await context.Categories
                .AsNoTracking()
                .OrderBy(category => category.Name)
                .Select(category => new CategoryDto
                {
                    IdCategory = category.IdCategory,
                    Name = category.Name,
                    Description = category.Description,
                    IsActive = category.IsActive
                })
                .ToListAsync(cancellationToken);

            return categories;
        }
    }
}