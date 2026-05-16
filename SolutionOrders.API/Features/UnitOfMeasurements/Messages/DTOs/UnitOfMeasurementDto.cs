namespace SolutionOrders.API.Features.UnitOfMeasurements.Messages.DTOs
{
    // DTO  - model jednostki miary zwracany przez API
    public class UnitOfMeasurementDto
    {
        public int IdUnitOfMeasurement { get; set; }
        public string? Name { get; set; }
        public string? Shortcut { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}