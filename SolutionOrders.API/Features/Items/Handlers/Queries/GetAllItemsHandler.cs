using Mapster;
using MediatR;
using SolutionOrders.API.Features.Items.Messages.DTOs;
using SolutionOrders.API.Features.Items.Messages.Queries;
using SolutionOrders.API.Features.Items.Providers;

namespace SolutionOrders.API.Features.Items.Handlers.Queries
{
    public class GetAllItemsHandler : IRequestHandler<GetAllItemsQuery, IEnumerable<ItemDto>>
    {
        private readonly IItemProvider _itemProvider;

        public GetAllItemsHandler(IItemProvider itemProvider)
        {
            _itemProvider = itemProvider;
        }

        public async Task<IEnumerable<ItemDto>> Handle(
            GetAllItemsQuery request,
            CancellationToken cancellationToken)
        {
            var items = await _itemProvider.GetAllItemsAsync(
                true,
                cancellationToken);

            return items.Adapt<IEnumerable<ItemDto>>();
        }
    }
}