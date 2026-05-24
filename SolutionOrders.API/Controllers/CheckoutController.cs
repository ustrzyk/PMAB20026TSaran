using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Checkout.Messages.Commands;
using SolutionOrders.API.Features.Checkout.Messages.DTOs;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController(IMediator mediator) : ControllerBase
    {
        /// <summary>
        /// Finalizuje koszyk i tworzy zamówienie klienta
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CheckoutOrderResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrderFromCart(
            [FromBody] CreateCheckoutOrderCommand command)
        {
            try
            {
                var result = await mediator.Send(command);

                return Created(
                    $"/api/Order/{result.IdOrder}",
                    result
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}