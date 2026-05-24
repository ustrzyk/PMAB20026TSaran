using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Checkout.Messages.Commands;
using SolutionOrders.API.Features.Checkout.Messages.DTOs;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Checkout.Handlers.Commands
{
    public class CreateCheckoutOrderCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateCheckoutOrderCommand, CheckoutOrderResponseDto>
    {
        public async Task<CheckoutOrderResponseDto> Handle(
            CreateCheckoutOrderCommand request,
            CancellationToken cancellationToken)
        {
            if (request.Client == null)
            {
                throw new ArgumentException("Dane klienta są wymagane");
            }

            if (string.IsNullOrWhiteSpace(request.Client.Name))
            {
                throw new ArgumentException("Imię i nazwisko klienta jest wymagane");
            }

            if (string.IsNullOrWhiteSpace(request.Client.Address))
            {
                throw new ArgumentException("Adres dostawy jest wymagany");
            }

            if (string.IsNullOrWhiteSpace(request.Client.PhoneNumber))
            {
                throw new ArgumentException("Numer telefonu jest wymagany");
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                throw new ArgumentException("Koszyk jest pusty");
            }

            var normalizedItems = request.Items
                .GroupBy(item => item.IdItem)
                .Select(group => new
                {
                    IdItem = group.Key,
                    Quantity = group.Sum(item => item.Quantity)
                })
                .ToList();

            foreach (var cartItem in normalizedItems)
            {
                if (cartItem.IdItem <= 0)
                {
                    throw new ArgumentException("Produkt w koszyku jest niepoprawny");
                }

                if (cartItem.Quantity <= 0)
                {
                    throw new ArgumentException("Ilość produktu w koszyku musi być większa od 0");
                }
            }

            var itemIds = normalizedItems
                .Select(item => item.IdItem)
                .ToList();

            var products = await context.Items
                .Where(item =>
                    itemIds.Contains(item.IdItem) &&
                    item.IsActive)
                .ToListAsync(cancellationToken);

            if (products.Count != itemIds.Count)
            {
                throw new ArgumentException("Jeden z produktów w koszyku nie istnieje albo jest nieaktywny");
            }

            var worker = await context.Workers
                .Where(worker => worker.IsActive)
                .OrderBy(worker => worker.IdWorker)
                .FirstOrDefaultAsync(cancellationToken);

            if (worker == null)
            {
                throw new ArgumentException("Brak aktywnego pracownika do obsługi zamówienia");
            }

            await using var transaction = await context.Database
                .BeginTransactionAsync(cancellationToken);

            try
            {
                var client = new Client
                {
                    Name = request.Client.Name.Trim(),
                    Adress = request.Client.Address.Trim(),
                    PhoneNumber = request.Client.PhoneNumber.Trim(),
                    IsActive = true
                };

                context.Clients.Add(client);

                await context.SaveChangesAsync(cancellationToken);

                var order = new Order
                {
                    DataOrder = DateTime.Now,
                    IdClient = client.IdClient,
                    IdWorker = worker.IdWorker,
                    Notes = request.Notes,
                    DeliveryDate = request.DeliveryDate ?? DateTime.Now.AddDays(3)
                };

                context.Orders.Add(order);

                await context.SaveChangesAsync(cancellationToken);

                decimal totalValue = 0;

                foreach (var cartItem in normalizedItems)
                {
                    var product = products
                        .First(item => item.IdItem == cartItem.IdItem);

                    var availableQuantity = product.Quantity ?? 0;

                    if (availableQuantity < cartItem.Quantity)
                    {
                        throw new ArgumentException(
                            $"Produkt \"{product.Name}\" ma za mały stan magazynowy. Dostępne: {availableQuantity}");
                    }

                    product.Quantity = availableQuantity - cartItem.Quantity;

                    var orderItem = new OrderItem
                    {
                        IdOrder = order.IdOrder,
                        IdItem = product.IdItem,
                        Quantity = cartItem.Quantity,
                        IsActive = true
                    };

                    context.OrderItems.Add(orderItem);

                    totalValue += cartItem.Quantity * (product.Price ?? 0);
                }

                await context.SaveChangesAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);

                return new CheckoutOrderResponseDto
                {
                    IdOrder = order.IdOrder,
                    IdClient = client.IdClient,
                    TotalValue = totalValue,
                    Message = "Zamówienie zostało złożone"
                };
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}