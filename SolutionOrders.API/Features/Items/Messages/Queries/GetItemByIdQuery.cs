using MediatR;
using SolutionOrders.API.Features.Items.Messages.DTOs;

namespace SolutionOrders.API.Features.Items.Messages.Queries
{
    // Query z parametrem (Id)
    public class GetItemByIdQuery : IRequest<ItemDto?>
    {
        public int Id { get; set; }

        public GetItemByIdQuery(int id)
        {
            Id = id;
        }
    }
}
