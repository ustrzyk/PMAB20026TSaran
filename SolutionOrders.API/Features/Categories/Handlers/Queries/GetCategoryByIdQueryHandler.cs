using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Categories.Messages.DTOs;
using SolutionOrders.API.Features.Categories.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Categories.Handlers.Queries
{
    public class GetCategoryByIdQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetCategoryByIdQuery, CategoryDto?>
    {
        public async Task<CategoryDto?> Handle(
            GetCategoryByIdQuery request,
            CancellationToken cancellationToken)
        {
            var category = await context.Categories
                .AsNoTracking()
                .Where(category => category.IdCategory == request.Id)
                .Select(category => new CategoryDto
                {
                    IdCategory = category.IdCategory,
                    Name = category.Name,
                    Description = category.Description,
                    IsActive = category.IsActive
                })
                .FirstOrDefaultAsync(cancellationToken);

            return category;
        }
    }
}