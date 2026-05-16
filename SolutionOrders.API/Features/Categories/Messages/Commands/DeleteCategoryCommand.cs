using MediatR;

namespace SolutionOrders.API.Features.Categories.Messages.Commands
{
    public class DeleteCategoryCommand(int idCategory) : IRequest<Unit>
    {
        public int IdCategory { get; set; } = idCategory;
    }
}