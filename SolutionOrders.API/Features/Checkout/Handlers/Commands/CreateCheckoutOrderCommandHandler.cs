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
                var client = await FindExistingClient(
                    request.Client,
                    cancellationToken);

                if (client == null)
                {
                    ValidateGuestClient(request.Client);

                    client = new Client
                    {
                        Name = request.Client.Name?.Trim(),
                        Adress = request.Client.Address?.Trim(),
                        PhoneNumber = request.Client.PhoneNumber?.Trim(),
                        Email = NormalizeEmail(request.Client.Email),
                        IsActive = true
                    };

                    context.Clients.Add(client);

                    await context.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    UpdateClientDeliveryData(client, request.Client);

                    await context.SaveChangesAsync(cancellationToken);
                }

                var deliveryAddress = request.Client.Address?.Trim();

                if (string.IsNullOrWhiteSpace(deliveryAddress))
                {
                    deliveryAddress = client.Adress;
                }

                var phoneNumber = request.Client.PhoneNumber?.Trim();

                if (string.IsNullOrWhiteSpace(phoneNumber))
                {
                    phoneNumber = client.PhoneNumber;
                }

                if (string.IsNullOrWhiteSpace(deliveryAddress))
                {
                    throw new ArgumentException("Adres dostawy jest wymagany");
                }

                if (string.IsNullOrWhiteSpace(phoneNumber))
                {
                    throw new ArgumentException("Numer telefonu jest wymagany");
                }

                var order = new Order
                {
                    DataOrder = DateTime.Now,
                    IdClient = client.IdClient,
                    IdWorker = worker.IdWorker,
                    Notes = request.Notes,
                    DeliveryDate = request.DeliveryDate ?? DateTime.Now.AddDays(3),
                    IsActive = true
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

        private async Task<Client?> FindExistingClient(
            CheckoutClientDto checkoutClient,
            CancellationToken cancellationToken)
        {
            if (checkoutClient.IdClient.HasValue && checkoutClient.IdClient.Value > 0)
            {
                return await context.Clients
                    .FirstOrDefaultAsync(client =>
                        client.IdClient == checkoutClient.IdClient.Value &&
                        client.IsActive,
                        cancellationToken);
            }

            var email = NormalizeEmail(checkoutClient.Email);

            if (!string.IsNullOrWhiteSpace(email))
            {
                return await context.Clients
                    .FirstOrDefaultAsync(client =>
                        client.Email != null &&
                        client.Email.ToLower() == email &&
                        client.IsActive,
                        cancellationToken);
            }

            return null;
        }

        private static string? NormalizeEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            return email.Trim().ToLower();
        }

        private static void ValidateGuestClient(CheckoutClientDto client)
        {
            if (string.IsNullOrWhiteSpace(client.Name))
            {
                throw new ArgumentException("Imię i nazwisko klienta jest wymagane");
            }

            if (string.IsNullOrWhiteSpace(client.Address))
            {
                throw new ArgumentException("Adres dostawy jest wymagany");
            }

            if (string.IsNullOrWhiteSpace(client.PhoneNumber))
            {
                throw new ArgumentException("Numer telefonu jest wymagany");
            }
        }

        private static void UpdateClientDeliveryData(
            Client client,
            CheckoutClientDto checkoutClient)
        {
            if (!string.IsNullOrWhiteSpace(checkoutClient.Name))
            {
                client.Name = checkoutClient.Name.Trim();
            }

            if (!string.IsNullOrWhiteSpace(checkoutClient.Address))
            {
                client.Adress = checkoutClient.Address.Trim();
            }

            if (!string.IsNullOrWhiteSpace(checkoutClient.PhoneNumber))
            {
                client.PhoneNumber = checkoutClient.PhoneNumber.Trim();
            }

            var email = NormalizeEmail(checkoutClient.Email);

            if (!string.IsNullOrWhiteSpace(email))
            {
                client.Email = email;
            }
        }
    }
}