using Mapster;
using MediatR;
using SolutionOrders.API.Features.Items.Messages.DTOs;
using SolutionOrders.API.Features.Items.Messages.Queries;
using SolutionOrders.API.Features.Items.Providers;

namespace SolutionOrders.API.Features.Items.Handlers.Queries
{
    public class GetItemByIdHandler : IRequestHandler<GetItemByIdQuery, ItemDto?>
    {
        private readonly IItemProvider _itemProvider;

        public GetItemByIdHandler(IItemProvider itemProvider)
        {
            _itemProvider = itemProvider;
        }

        public async Task<ItemDto?> Handle(GetItemByIdQuery request, CancellationToken cancellationToken)
        {
            return (await _itemProvider.GetItemByIdAsync(request.Id,true, cancellationToken))?
                .Adapt<ItemDto>();
        }
    }
}