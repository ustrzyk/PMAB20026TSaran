using MediatR;

namespace SolutionOrders.API.Features.Items.Messages.Commands
{
    public class DeleteItemCommand(int idItem) : IRequest<Unit>
    {
        public int IdItem { get; set; } = idItem;
    }
}