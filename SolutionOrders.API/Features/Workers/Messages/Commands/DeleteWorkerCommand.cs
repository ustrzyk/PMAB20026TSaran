using MediatR;

namespace SolutionOrders.API.Features.Workers.Messages.Commands
{
    public class DeleteWorkerCommand(int idWorker) : IRequest<Unit>
    {
        public int IdWorker { get; set; } = idWorker;
    }
}