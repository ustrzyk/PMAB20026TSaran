using MediatR;
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

            var worker = new Worker
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Login = request.Login,
                Password = request.Password,
                IsActive = true
            };

            context.Workers.Add(worker);

            await context.SaveChangesAsync(cancellationToken);

            return worker.IdWorker;
        }
    }
}