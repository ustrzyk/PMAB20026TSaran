using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Categories.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Categories.Handlers.Commands
{
    public class DeleteCategoryCommandHandler(ApplicationDbContext context)
        : IRequestHandler<DeleteCategoryCommand, Unit>
    {
        public async Task<Unit> Handle(
            DeleteCategoryCommand request,
            CancellationToken cancellationToken)
        {
            var category = await context.Categories
                .FirstOrDefaultAsync(category =>
                        category.IdCategory == request.IdCategory,
                    cancellationToken);

            if (category == null)
            {
                throw new KeyNotFoundException(
                    $"Kategoria o ID {request.IdCategory} nie istnieje");
            }

            if (!category.IsActive)
            {
                return Unit.Value;
            }

            var hasItems = await context.Items
                .AnyAsync(item =>
                        item.IdCategory == request.IdCategory &&
                        item.IsActive,
                    cancellationToken);

            if (hasItems)
            {
                throw new InvalidOperationException(
                    "Nie można usunąć kategorii, ponieważ są do niej przypisane produkty");
            }

            category.IsActive = false;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}