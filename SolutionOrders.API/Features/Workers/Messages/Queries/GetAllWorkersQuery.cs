using MediatR;
using SolutionOrders.API.Features.Workers.Messages.DTOs;

namespace SolutionOrders.API.Features.Workers.Messages.Queries
{
    public class GetAllWorkersQuery : IRequest<IEnumerable<WorkerDto>>
    {
    }
}