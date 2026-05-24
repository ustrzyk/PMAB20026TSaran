using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Workers.Messages.DTOs;
using SolutionOrders.API.Features.Workers.Messages.Queries;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Workers.Handlers.Queries
{
    public class GetAllWorkersQueryHandler(ApplicationDbContext context)
        : IRequestHandler<GetAllWorkersQuery, IEnumerable<WorkerDto>>
    {
        public async Task<IEnumerable<WorkerDto>> Handle(
            GetAllWorkersQuery request,
            CancellationToken cancellationToken)
        {
            var workers = await context.Workers
                .AsNoTracking()
                .OrderBy(worker => worker.LastName)
                .ThenBy(worker => worker.FirstName)
                .Select(worker => new WorkerDto
                {
                    IdWorker = worker.IdWorker,
                    FirstName = worker.FirstName,
                    LastName = worker.LastName,
                    Login = worker.Login,
                    IsActive = worker.IsActive
                })
                .ToListAsync(cancellationToken);

            return workers;
        }
    }
}