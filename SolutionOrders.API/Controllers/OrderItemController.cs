using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.OrderItems.Messages.Commands;
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

        /// <summary>
        /// Pobiera pozycje dla konkretnego zamówienia
        /// </summary>
        [HttpGet("Order/{idOrder}")]
        [ProducesResponseType(typeof(IEnumerable<OrderItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByOrderId(int idOrder)
        {
            var query = new GetOrderItemsByOrderIdQuery(idOrder);

            return Ok(await mediator.Send(query));
        }

        /// <summary>
        /// Tworzy nową pozycję zamówienia
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateOrderItemCommand command)
        {
            try
            {
                var orderItemId = await mediator.Send(command);

                // HTTP 201 Created z Location header
                return CreatedAtAction(nameof(GetById), new { id = orderItemId },
                    new { id = orderItemId, message = "Pozycja zamówienia została utworzona" }
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje pozycję zamówienia
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateOrderItemCommand command)
        {
            if (id != command.IdOrderItem)
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

        /// <summary>
        /// Usuwa pozycję zamówienia (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteOrderItemCommand(id);

            try
            {
                await mediator.Send(command);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}