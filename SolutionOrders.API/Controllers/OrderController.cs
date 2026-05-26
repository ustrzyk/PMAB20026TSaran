using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Orders.Messages.Commands;
using SolutionOrders.API.Features.Orders.Messages.DTOs;
using SolutionOrders.API.Features.Orders.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllOrders()
        {
            var query = new GetAllOrdersQuery();

            return Ok(await mediator.Send(query));
        }

        [HttpGet("Client/{idClient}")]
        [ProducesResponseType(typeof(IEnumerable<OrderDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetOrdersByClient(int idClient)
        {
            try
            {
                var query = new GetOrdersByClientQuery(idClient);

                return Ok(await mediator.Send(query));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetOrderByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Zamówienie o ID {id} nie zostało znalezione" });
            }

            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateOrderCommand command)
        {
            try
            {
                var orderId = await mediator.Send(command);

                return CreatedAtAction(nameof(GetById), new { id = orderId },
                    new { id = orderId, message = "Zamówienie zostało utworzone" }
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateOrderCommand command)
        {
            if (id != command.IdOrder)
            {
                return BadRequest(new { message = "ID w URL różni się od ID w body" });
            }

            try
            {
                await mediator.Send(command);

                return NoContent();
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

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteOrderCommand(id);

            try
            {
                await mediator.Send(command);

                return NoContent();
            }
            catch (InvalidOperationException ex)
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