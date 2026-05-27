using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Clients.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Commands
{
    public class UpdateClientCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateClientCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateClientCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Nazwa klienta jest wymagana");
            }

            var client = await context.Clients
                .FirstOrDefaultAsync(client =>
                        client.IdClient == request.IdClient,
                    cancellationToken);

            if (client == null)
            {
                throw new KeyNotFoundException(
                    $"Klient o ID {request.IdClient} nie istnieje");
            }

            var email = request.Email?.Trim().ToLower();

            if (!string.IsNullOrWhiteSpace(email))
            {
                var emailExists = await context.Clients
                    .AnyAsync(existingClient =>
                        existingClient.IdClient != request.IdClient &&
                        existingClient.Email != null &&
                        existingClient.Email.ToLower() == email,
                        cancellationToken);

                if (emailExists)
                {
                    throw new ArgumentException("Klient z takim adresem e-mail już istnieje");
                }
            }

            client.Name = request.Name.Trim();
            client.Adress = request.Adress;
            client.PhoneNumber = request.PhoneNumber;
            client.Email = email;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                client.Password = request.Password.Trim();
            }

            client.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}