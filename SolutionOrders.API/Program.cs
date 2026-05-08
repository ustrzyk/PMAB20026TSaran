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

            RegisterDbContextAndMediatr(builder);
            RegisterMappers();
            RegisterServices(builder);
            RegisterProviders(builder);
            RegisterControlerAndOpenApi(builder);
            RegisterSecurity(builder);
            SetUpCorsPolicy(builder);
            var app = builder.Build();
            ConfigureDevelopment(app);
            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }

        private static void RegisterSecurity(WebApplicationBuilder builder)
        {
            builder.Services.AddAuthorization();
        }

        private static void RegisterControlerAndOpenApi(WebApplicationBuilder builder)
        {
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
        }

        private static void RegisterDbContextAndMediatr(WebApplicationBuilder builder)
        {
            // DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")));

            // MediatR
            builder.Services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        }

        private static void RegisterMappers()
        {
            TypeAdapterConfig.GlobalSettings.Scan(Assembly.GetExecutingAssembly());
        }

        private static void RegisterServices(WebApplicationBuilder builder)
        {
            builder.Services.AddTransient<IItemService, ItemService>();
        }
        private static void RegisterProviders(WebApplicationBuilder builder)
        {
            builder.Services.AddTransient<IItemProvider, ItemProvider>();
        }

        private static void SetUpCorsPolicy(WebApplicationBuilder builder)
        {
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy => policy
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });
        }

        private static void ConfigureDevelopment(WebApplication app)
        {
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
            

                app.MapOpenApi();

                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/openapi/v1.json", "v1");
                });
            }
        }
    }
}