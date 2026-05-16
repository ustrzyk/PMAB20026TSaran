using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Clients.Messages.Commands;
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

        /// <summary>
        /// Tworzy nowego klienta
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateClientCommand command)
        {
            try
            {
                var clientId = await mediator.Send(command);

                // HTTP 201 Created z Location header
                return CreatedAtAction(nameof(GetById), new { id = clientId },
                    new { id = clientId, message = "Klient został utworzony" }
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje klienta
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateClientCommand command)
        {
            if (id != command.IdClient)
            {
                return BadRequest(new { message = "ID w URL różni się od ID w body" });
            }

            try
            {
                await mediator.Send(command);
                return NoContent();  // HTTP 204 - sukces bez body
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}