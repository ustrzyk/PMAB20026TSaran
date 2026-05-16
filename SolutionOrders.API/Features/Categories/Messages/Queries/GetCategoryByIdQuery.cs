using MediatR;
using SolutionOrders.API.Features.Categories.Messages.DTOs;

namespace SolutionOrders.API.Features.Categories.Messages.Queries
{
    // Query z parametrem Id
    public class GetCategoryByIdQuery : IRequest<CategoryDto?>
    {
        public int Id { get; set; }

        public GetCategoryByIdQuery(int id)
        {
            Id = id;
        }
    }
}