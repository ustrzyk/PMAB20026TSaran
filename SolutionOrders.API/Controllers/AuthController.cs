using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Auth.Messages.DTOs;
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
    }
}