using Mapster;
using SolutionOrders.API.Features.Items.Messages.DTOs;
using SolutionOrders.API.Models;

namespace SolutionOrders.API.Configuration
{
    public class MapsterConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Item, ItemDto>()
                .Map(dest => dest.CategoryName, src => src.Category.Name)
                .Map(
                    dest => dest.UnitName,
                    src => src.UnitOfMeasurement != null
                        ? src.UnitOfMeasurement.Name
                        : null);
        }
    }
}
