using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Dashboard.Messages.DTOs;
using SolutionOrders.API.Features.Dashboard.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController(IMediator mediator) : ControllerBase
    {
        /// <summary>
        /// Pobiera dane raportowe dla Dashboardu
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(DashboardDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDashboard()
        {
            // Tworzymy Query
            var query = new GetDashboardQuery();

            // Wysyłamy do MediatR
            return Ok(await mediator.Send(query));
        }
    }
}