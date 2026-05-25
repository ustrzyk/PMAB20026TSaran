using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Clients.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Commands
{
    public class CreateClientCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateClientCommand, int>
    {
        public async Task<int> Handle(
            CreateClientCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa klienta jest wymagana");
            }

            var email = request.Email?.Trim().ToLower();

            if (!string.IsNullOrWhiteSpace(email))
            {
                var emailExists = await context.Clients
                    .AnyAsync(client =>
                            client.Email != null &&
                            client.Email.ToLower() == email,
                        cancellationToken);

                if (emailExists)
                {
                    throw new ArgumentException("Klient z takim adresem e-mail już istnieje");
                }
            }

            var client = new Client
            {
                Name = request.Name.Trim(),
                Adress = request.Adress,
                PhoneNumber = request.PhoneNumber,
                Email = email,
                Password = request.Password,
                IsActive = request.IsActive
            };

            context.Clients.Add(client);

            await context.SaveChangesAsync(cancellationToken);

            return client.IdClient;
        }
    }
}