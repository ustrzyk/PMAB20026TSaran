using Mapster;
using SolutionOrders.API.Features.Items.Messages.Commands;
using SolutionOrders.API.Features.Items.Messages.DTOs;
using SolutionOrders.API.Models;

namespace SolutionOrders.API.Features.Items.Mappings
{
    public class ItemMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Item, ItemDto>()
                .Map(dest => dest.CategoryName, src => src.Category.Name)
                .Map(dest => dest.UnitName, src => src.UnitOfMeasurement != null ? src.UnitOfMeasurement.Name : null);

            config.NewConfig<CreateItemCommand, Item>()
                .Map(dest => dest.IsActive, _ => true)
                .Ignore(dest => dest.IdItem)
                .Ignore(dest => dest.Category)
                .Ignore(dest => dest.UnitOfMeasurement!)
                .Ignore(dest => dest.OrderItems);

            config.NewConfig<UpdateItemCommand, Item>()
                .Ignore(dest => dest.IdItem)
                .Ignore(dest => dest.Category)
                .Ignore(dest => dest.UnitOfMeasurement!)
                .Ignore(dest => dest.OrderItems);
        }
    }
}