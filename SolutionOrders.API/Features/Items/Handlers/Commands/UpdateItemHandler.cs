using MediatR;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Items.Messages.Commands;
using SolutionOrders.API.Models.Data;

namespace SolutionOrders.API.Features.Items.Handlers.Commands
{
    public class UpdateItemHandler : IRequestHandler<UpdateItemCommand, Unit>
    {
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UpdateItemHandler> _logger;

    public UpdateItemHandler(
        ApplicationDbContext context,
        ILogger<UpdateItemHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Unit> Handle(
        UpdateItemCommand request,
        CancellationToken cancellationToken)
    {
        // Znajdź rekord
        var item = await _context.Items
            .FirstOrDefaultAsync(i => i.IdItem == request.IdItem, cancellationToken);

        if (item == null)
        {
            throw new KeyNotFoundException($"Produkt o ID {request.IdItem} nie istnieje");
        }

        _logger.LogInformation("Aktualizacja produktu ID: {IdItem}", request.IdItem);

        // Aktualizacja pól
        item.Name = request.Name;
        item.Description = request.Description;
        item.IdCategory = request.IdCategory;
        item.Price = request.Price;
        item.Quantity = request.Quantity;
        item.FotoUrl = request.FotoUrl;
        item.IdUnitOfMeasurement = request.IdUnitOfMeasurement;
        item.Code = request.Code;
        item.IsActive = request.IsActive;

        // Zapis
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Zaktualizowano produkt ID: {IdItem}", request.IdItem);

        return Unit.Value;  // MediatR Unit = void
    }
    }
}