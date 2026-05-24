using MediatR;
using SolutionOrders.API.Features.Dashboard.Messages.DTOs;

namespace SolutionOrders.API.Features.Dashboard.Messages.Queries
{
    public class GetDashboardQuery : IRequest<DashboardDto>
    {
    }
}