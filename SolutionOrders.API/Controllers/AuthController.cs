using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Auth.Messages.DTOs;
using SolutionOrders.API.Models;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(ApplicationDbContext context) : ControllerBase
    {
        [HttpPost("worker-login")]
        [ProducesResponseType(typeof(WorkerLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> WorkerLogin(
            [FromBody] WorkerLoginRequestDto request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Login))
            {
                return BadRequest(new { message = "Podaj login pracownika" });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Podaj hasło pracownika" });
            }

            var login = request.Login.Trim();
            var password = request.Password.Trim();

            var worker = await context.Workers
                .AsNoTracking()
                .FirstOrDefaultAsync(worker =>
                    worker.Login == login &&
                    worker.Password == password &&
                    worker.IsActive,
                    cancellationToken);

            if (worker == null)
            {
                return Unauthorized(new
                {
                    message = "Nieprawidłowy login, hasło albo konto jest nieaktywne"
                });
            }

            var name = $"{worker.FirstName} {worker.LastName}".Trim();

            if (name.Length == 0)
            {
                name = worker.Login;
            }

            var role = string.Equals(
                worker.Role,
                "Admin",
                StringComparison.OrdinalIgnoreCase)
                ? "Admin"
                : "Worker";

            return Ok(new WorkerLoginResponseDto
            {
                IdWorker = worker.IdWorker,
                Name = name,
                Login = worker.Login,
                Role = role
            });
        }

        [HttpPost("customer-login")]
        [ProducesResponseType(typeof(CustomerLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CustomerLogin(
            [FromBody] CustomerLoginRequestDto request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Podaj e-mail klienta" });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Podaj hasło klienta" });
            }

            var email = request.Email.Trim().ToLower();
            var password = request.Password.Trim();

            var client = await context.Clients
                .AsNoTracking()
                .FirstOrDefaultAsync(client =>
                    client.Email != null &&
                    client.Email.ToLower() == email &&
                    client.Password == password &&
                    client.IsActive,
                    cancellationToken);

            if (client == null)
            {
                return Unauthorized(new
                {
                    message = "Nieprawidłowy e-mail, hasło albo konto klienta jest nieaktywne"
                });
            }

            return Ok(new CustomerLoginResponseDto
            {
                IdClient = client.IdClient,
                Name = client.Name ?? client.Email ?? "Klient",
                Email = client.Email ?? email,
                Adress = client.Adress,
                PhoneNumber = client.PhoneNumber
            });
        }

        [HttpPost("customer-register")]
        [ProducesResponseType(typeof(CustomerLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CustomerRegister(
            [FromBody] CustomerRegisterRequestDto request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Podaj imię i nazwisko klienta" });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Podaj e-mail klienta" });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Podaj hasło klienta" });
            }

            var name = request.Name.Trim();
            var email = request.Email.Trim().ToLower();
            var password = request.Password.Trim();

            var emailExists = await context.Clients
                .AnyAsync(client =>
                    client.Email != null &&
                    client.Email.ToLower() == email,
                    cancellationToken);

            if (emailExists)
            {
                return BadRequest(new { message = "Konto klienta z takim e-mailem już istnieje" });
            }

            var client = new Client
            {
                Name = name,
                Email = email,
                Password = password,
                Adress = request.Adress,
                PhoneNumber = request.PhoneNumber,
                IsActive = true
            };

            context.Clients.Add(client);

            await context.SaveChangesAsync(cancellationToken);

            return Ok(new CustomerLoginResponseDto
            {
                IdClient = client.IdClient,
                Name = client.Name ?? email,
                Email = client.Email ?? email,
                Adress = client.Adress,
                PhoneNumber = client.PhoneNumber
            });
        }
    }
}