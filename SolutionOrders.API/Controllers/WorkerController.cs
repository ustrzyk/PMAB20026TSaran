using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Workers.Messages.Commands;
using SolutionOrders.API.Features.Workers.Messages.DTOs;
using SolutionOrders.API.Features.Workers.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<WorkerDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllWorkers()
        {
            // Tworzymy Query
            var query = new GetAllWorkersQuery();

            // Wysyłamy do MediatR
            return Ok(await mediator.Send(query));
        }

        /// <summary>
        /// Pobiera pracownika po ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(WorkerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetWorkerByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Pracownik o ID {id} nie został znaleziony" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Tworzy nowego pracownika
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateWorkerCommand command)
        {
            try
            {
                var workerId = await mediator.Send(command);

                // HTTP 201 Created z Location header
                return CreatedAtAction(nameof(GetById), new { id = workerId },
                    new { id = workerId, message = "Pracownik został utworzony" }
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje pracownika
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkerCommand command)
        {
            if (id != command.IdWorker)
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