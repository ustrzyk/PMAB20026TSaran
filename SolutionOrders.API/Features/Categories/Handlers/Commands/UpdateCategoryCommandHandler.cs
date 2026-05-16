using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Categories.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Categories.Handlers.Commands
{
    public class UpdateCategoryCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateCategoryCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateCategoryCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa kategorii jest wymagana");
            }

            var category = await context.Categories
                .FirstOrDefaultAsync(category =>
                        category.IdCategory == request.IdCategory &&
                        category.IsActive,
                    cancellationToken);

            if (category == null)
            {
                throw new KeyNotFoundException(
                    $"Kategoria o ID {request.IdCategory} nie istnieje");
            }

            category.Name = request.Name;
            category.Description = request.Description;
            category.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}