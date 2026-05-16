using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Clients.Messages.DTOs;
using SolutionOrders.API.Features.Clients.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ClientDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllClients()
        {
            // Tworzymy Query
            var query = new GetAllClientsQuery();

            // Wysyłamy do MediatR
            return Ok(await mediator.Send(query));
        }

        /// <summary>
        /// Pobiera klienta po ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClientDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetClientByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Klient o ID {id} nie został znaleziony" });
            }

            return Ok(result);
        }
    }
}