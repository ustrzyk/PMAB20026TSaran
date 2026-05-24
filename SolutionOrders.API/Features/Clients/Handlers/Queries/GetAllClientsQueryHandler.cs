using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Clients.Messages.DTOs;
using SolutionOrders.API.Features.Clients.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Clients.Handlers.Queries
{
    public class GetAllClientsQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetAllClientsQuery, IEnumerable<ClientDto>>
    {
        public async Task<IEnumerable<ClientDto>> Handle(
            GetAllClientsQuery request,
            CancellationToken cancellationToken)
        {
            var clients = await context.Clients
                .AsNoTracking()
                .OrderBy(client => client.Name)
                .Select(client => new ClientDto
                {
                    IdClient = client.IdClient,
                    Name = client.Name,
                    Adress = client.Adress,
                    PhoneNumber = client.PhoneNumber,
                    IsActive = client.IsActive
                })
                .ToListAsync(cancellationToken);

            return clients;
        }
    }
}