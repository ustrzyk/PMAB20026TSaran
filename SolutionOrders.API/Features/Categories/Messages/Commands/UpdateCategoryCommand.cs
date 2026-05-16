using MediatR;

namespace SolutionOrders.API.Features.Categories.Messages.Commands
{
    public class UpdateCategoryCommand : IRequest<Unit>
    {
        public int IdCategory { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}