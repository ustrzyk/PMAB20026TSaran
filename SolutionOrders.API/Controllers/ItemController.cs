using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Items.Messages.DTOs;
using SolutionOrders.API.Features.Items.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly IMediator _mediator;

        // Dependency Injection - MediatR
        public ItemController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<ItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllItems()
        {
            // Tworzymy Query
            var query = new GetAllItemsQuery();

            // Wysyłamy do MediatR
            return Ok(await _mediator.Send(query));
        }
    }
}
