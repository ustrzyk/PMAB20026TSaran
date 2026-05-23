using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.OrderItems.Messages.DTOs;
using SolutionOrders.API.Features.OrderItems.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllOrderItems()
        {
            // Tworzymy Query
            var query = new GetAllOrderItemsQuery();

            // Wysyłamy do MediatR
            return Ok(await mediator.Send(query));
        }

        /// <summary>
        /// Pobiera pozycję zamówienia po ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrderItemDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetOrderItemByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Pozycja zamówienia o ID {id} nie została znaleziona" });
            }

            return Ok(result);
        }
    }
}