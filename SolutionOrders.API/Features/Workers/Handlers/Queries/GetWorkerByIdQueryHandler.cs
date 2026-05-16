using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Workers.Messages.DTOs;
using SolutionOrders.API.Features.Workers.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Workers.Handlers.Queries
{
    public class GetWorkerByIdQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetWorkerByIdQuery, WorkerDto?>
    {
        public async Task<WorkerDto?> Handle(
            GetWorkerByIdQuery request,
            CancellationToken cancellationToken)
        {
            var worker = await context.Workers
                .AsNoTracking()
                .Where(worker =>
                    worker.IdWorker == request.Id &&
                    worker.IsActive)
                .Select(worker => new WorkerDto
                {
                    IdWorker = worker.IdWorker,
                    FirstName = worker.FirstName,
                    LastName = worker.LastName,
                    Login = worker.Login,
                    IsActive = worker.IsActive
                })
                .FirstOrDefaultAsync(cancellationToken);

            return worker;
        }
    }
}