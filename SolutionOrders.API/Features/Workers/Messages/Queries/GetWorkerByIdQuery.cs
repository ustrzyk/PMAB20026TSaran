using MediatR;
using SolutionOrders.API.Features.Workers.Messages.DTOs;

namespace SolutionOrders.API.Features.Workers.Messages.Queries
{
    public class GetWorkerByIdQuery : IRequest<WorkerDto?>
    {
        public int Id { get; set; }

        public GetWorkerByIdQuery(int id)
        {
            Id = id;
        }
    }
}