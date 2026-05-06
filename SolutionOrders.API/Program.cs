using Mapster;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Features.Items.Providers;
using SolutionOrders.API.Features.Items.Services;
using SolutionOrders.API.Models.Data;
using System.Reflection;

namespace SolutionOrders.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")));

            // MediatR
            builder.Services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            // Mapster
            TypeAdapterConfig.GlobalSettings.Scan(Assembly.GetExecutingAssembly());

            // Providers
            builder.Services.AddScoped<IItemProvider, ItemProvider>();

            // Services
            builder.Services.AddTransient<IItemService, ItemService>();

            // Kontrolery API
            builder.Services.AddControllers();

            // Autoryzacja
            builder.Services.AddAuthorization();

            // OpenAPI / Swagger
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Automatyczne zastosowanie migracji przy starcie
            using (var scope = app.Services.CreateScope())
            {
                try
                {
                    var dbContext =
                        scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    dbContext.Database.Migrate();
                }
                catch (Exception ex)
                {
                    var logger =
                        scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

                    logger.LogError(ex, "Błąd podczas migracji bazy danych");
                }
            }

            app.MapOpenApi();

            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/openapi/v1.json", "v1");
            });

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}