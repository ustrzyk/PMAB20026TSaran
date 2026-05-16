using MediatR;

namespace SolutionOrders.API.Features.Categories.Messages.Commands
{
    // Command = Request który ZMIENIA stan (CREATE)
    // Zwraca ID utworzonego rekordu
    public class CreateCategoryCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}