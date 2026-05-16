using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.DTOs;
using SolutionOrders.API.Features.UnitOfMeasurements.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitOfMeasurementController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UnitOfMeasurementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUnitOfMeasurements()
        {
            // Tworzymy Query
            var query = new GetAllUnitOfMeasurementsQuery();

            // Wysyłamy do MediatR
            return Ok(await mediator.Send(query));
        }

        /// <summary>
        /// Pobiera jednostkę miary po ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UnitOfMeasurementDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetUnitOfMeasurementByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Jednostka miary o ID {id} nie została znaleziona" });
            }

            return Ok(result);
        }
    }
}