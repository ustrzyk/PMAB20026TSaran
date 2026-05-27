namespace SolutionOrders.API.Features.Orders.Helpers
{
    public static class OrderStatusHelper
    {
        public const string New = "Nowe";
        public const string InProgress = "W realizacji";
        public const string Ready = "Gotowe";
        public const string Shipped = "Wysłane";
        public const string Completed = "Zakończone";
        public const string Cancelled = "Anulowane";

        private static readonly string[] AllowedStatuses =
        [
            New,
            InProgress,
            Ready,
            Shipped,
            Completed,
            Cancelled
        ];

        public static IReadOnlyCollection<string> GetAllowedStatuses()
        {
            return AllowedStatuses;
        }

        public static string Normalize(string? status, string? fallbackStatus = null)
        {
            var safeStatus = status?.Trim();

            if (string.IsNullOrWhiteSpace(safeStatus))
            {
                safeStatus = fallbackStatus?.Trim();
            }

            if (string.IsNullOrWhiteSpace(safeStatus))
            {
                return New;
            }

            if (!AllowedStatuses.Contains(safeStatus))
            {
                throw new ArgumentException(
                    $"Niepoprawny status zamówienia. Dozwolone statusy: {string.Join(", ", AllowedStatuses)}");
            }

            return safeStatus;
        }
    }
}