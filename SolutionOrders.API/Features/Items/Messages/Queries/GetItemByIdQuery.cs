using MediatR;
using SolutionOrders.API.Features.Items.Messages.DTOs;

namespace SolutionOrders.API.Features.Items.Messages.Queries
{
    public class GetItemByIdQuery : IRequest<ItemDto>
    {
    }
}
