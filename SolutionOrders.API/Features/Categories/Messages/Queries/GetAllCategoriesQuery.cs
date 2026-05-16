using MediatR;
using SolutionOrders.API.Features.Categories.Messages.DTOs;

namespace SolutionOrders.API.Features.Categories.Messages.Queries
{
    public class GetAllCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
    {
    }
}