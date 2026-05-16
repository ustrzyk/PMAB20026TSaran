using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Workers.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Workers.Handlers.Commands
{
    public class UpdateWorkerCommandHandler(ApplicationDbContext context)
        : IRequestHandler<UpdateWorkerCommand, Unit>
    {
        public async Task<Unit> Handle(
            UpdateWorkerCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                throw new ArgumentException("Imię pracownika jest wymagane");
            }

            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                throw new ArgumentException("Nazwisko pracownika jest wymagane");
            }

            if (string.IsNullOrWhiteSpace(request.Login))
            {
                throw new ArgumentException("Login pracownika jest wymagany");
            }

            var worker = await context.Workers
                .FirstOrDefaultAsync(worker =>
                        worker.IdWorker == request.IdWorker &&
                        worker.IsActive,
                    cancellationToken);

            if (worker == null)
            {
                throw new KeyNotFoundException(
                    $"Pracownik o ID {request.IdWorker} nie istnieje");
            }

            worker.FirstName = request.FirstName;
            worker.LastName = request.LastName;
            worker.Login = request.Login;
            worker.Password = request.Password;
            worker.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}