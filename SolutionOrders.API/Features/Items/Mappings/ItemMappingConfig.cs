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
            // Mapowanie encji Item na DTO zwracane przez API
            config.NewConfig<Item, ItemDto>()
                .Map(dest => dest.CategoryName, src => src.Category.Name) // Nazwa kategorii
                .Map(
                    dest => dest.UnitName,
                    src => src.UnitOfMeasurement != null
                        ? src.UnitOfMeasurement.Name
                        : null); // Nazwa jednostki miary

            // Mapowanie komendy tworzenia produktu na encję Item
            config.NewConfig<CreateItemCommand, Item>()
                .Map(dest => dest.IsActive, _ => true)       // Nowy produkt jest aktywny
                .Ignore(dest => dest.IdItem)                 // ID nada baza danych
                .Ignore(dest => dest.Category)               // Relacja nie jest mapowana z komendy
                .Ignore(dest => dest.UnitOfMeasurement!)     // Relacja nie jest mapowana z komendy
                .Ignore(dest => dest.OrderItems);            // Zamówienia nie są ustawiane przy tworzeniu

            // Mapowanie komendy aktualizacji produktu na encję Item
            config.NewConfig<UpdateItemCommand, Item>()
                .Ignore(dest => dest.IdItem)                 // Nie zmieniamy ID produktu
                .Ignore(dest => dest.Category)               // Relacja nie jest mapowana bezpośrednio
                .Ignore(dest => dest.UnitOfMeasurement!)     // Relacja nie jest mapowana bezpośrednio
                .Ignore(dest => dest.OrderItems);            // Nie aktualizujemy pozycji zamówień tutaj
        }
    }
}