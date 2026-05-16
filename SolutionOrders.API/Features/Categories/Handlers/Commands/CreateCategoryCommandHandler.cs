using MediatR;
using SolutionOrders.API.Features.Categories.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Categories.Handlers.Commands
{
    public class CreateCategoryCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateCategoryCommand, int>
    {
        public async Task<int> Handle(
            CreateCategoryCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa kategorii jest wymagana");
            }

            var category = new Category
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = true
            };

            context.Categories.Add(category);

            await context.SaveChangesAsync(cancellationToken);

            return category.IdCategory;
        }
    }
}