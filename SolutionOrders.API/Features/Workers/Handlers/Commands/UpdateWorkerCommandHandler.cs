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
                    worker.IdWorker == request.IdWorker,
                    cancellationToken);

            if (worker == null)
            {
                throw new KeyNotFoundException(
                    $"Pracownik o ID {request.IdWorker} nie istnieje");
            }

            var loginExists = await context.Workers
                .AnyAsync(otherWorker =>
                    otherWorker.IdWorker != request.IdWorker &&
                    otherWorker.Login == request.Login.Trim(),
                    cancellationToken);

            if (loginExists)
            {
                throw new ArgumentException("Inny pracownik ma już taki login");
            }

            worker.FirstName = request.FirstName.Trim();
            worker.LastName = request.LastName.Trim();
            worker.Login = request.Login.Trim();
            worker.Role = NormalizeRole(request.Role);

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                worker.Password = request.Password.Trim();
            }

            worker.IsActive = request.IsActive;

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }

        private static string NormalizeRole(string? role)
        {
            if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return "Admin";
            }

            return "Worker";
        }
    }
}