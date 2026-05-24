using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Clients.Messages.DTOs;
using SolutionOrders.API.Features.Clients.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Queries
{
    public class GetClientByIdQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetClientByIdQuery, ClientDto?>
    {
        public async Task<ClientDto?> Handle(
            GetClientByIdQuery request,
            CancellationToken cancellationToken)
        {
            var client = await context.Clients
                .AsNoTracking()
                .Where(client => client.IdClient == request.Id)
                .Select(client => new ClientDto
                {
                    IdClient = client.IdClient,
                    Name = client.Name,
                    Adress = client.Adress,
                    PhoneNumber = client.PhoneNumber,
                    IsActive = client.IsActive
                })
                .FirstOrDefaultAsync(cancellationToken);

            return client;
        }
    }
}