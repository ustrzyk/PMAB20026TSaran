using MediatR;
using SolutionOrders.API.Features.Clients.Messages.DTOs;

namespace SolutionOrders.API.Features.Clients.Messages.Queries
{
    public class GetClientByIdQuery : IRequest<ClientDto?>
    {
        public int Id { get; set; }

        public GetClientByIdQuery(int id)
        {
            Id = id;
        }
    }
}