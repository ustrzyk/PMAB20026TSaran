using MediatR;
using SolutionOrders.API.Features.Clients.Messages.DTOs;

namespace SolutionOrders.API.Features.Clients.Messages.Queries
{
    public class GetAllClientsQuery : IRequest<IEnumerable<ClientDto>>
    {
    }
}