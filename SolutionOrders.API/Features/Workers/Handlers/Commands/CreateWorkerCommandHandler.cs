using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Workers.Messages.Commands;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Workers.Handlers.Commands
{
    public class CreateWorkerCommandHandler(ApplicationDbContext context)
        : IRequestHandler<CreateWorkerCommand, int>
    {
        public async Task<int> Handle(
            CreateWorkerCommand request,
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

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("Hasło pracownika jest wymagane");
            }

            var loginExists = await context.Workers
                .AnyAsync(worker =>
                    worker.Login == request.Login.Trim(),
                    cancellationToken);

            if (loginExists)
            {
                throw new ArgumentException("Pracownik z takim loginem już istnieje");
            }

            var role = NormalizeRole(request.Role);

            var worker = new Worker
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Login = request.Login.Trim(),
                Password = request.Password.Trim(),
                Role = role,
                IsActive = request.IsActive
            };

            context.Workers.Add(worker);

            await context.SaveChangesAsync(cancellationToken);

            return worker.IdWorker;
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