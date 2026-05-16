using MediatR;
using Microsoft.AspNetCore.Mvc;
using SolutionOrders.API.Features.Categories.Messages.Commands;
using SolutionOrders.API.Features.Categories.Messages.DTOs;
using SolutionOrders.API.Features.Categories.Messages.Queries;

namespace SolutionOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCategories()
        {
            // Tworzymy Query
            var query = new GetAllCategoriesQuery();

            // Wysyłamy do MediatR
            return Ok(await mediator.Send(query));
        }

        /// <summary>
        /// Pobiera kategorię po ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetCategoryByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Kategoria o ID {id} nie została znaleziona" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Tworzy nową kategorię
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
        {
            try
            {
                var categoryId = await mediator.Send(command);

                // HTTP 201 Created z Location header
                return CreatedAtAction(nameof(GetById), new { id = categoryId },
                    new { id = categoryId, message = "Kategoria została utworzona" }
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Aktualizuje kategorię
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryCommand command)
        {
            if (id != command.IdCategory)
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