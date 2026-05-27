using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolutionOrders.API.Migrations
{
    /// <inheritdoc />
    public partial class AddClientLoginFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "IdClient",
                keyValue: 1,
                columns: new[] { "Email", "Password" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "IdClient",
                keyValue: 2,
                columns: new[] { "Email", "Password" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Clients",
                keyColumn: "IdClient",
                keyValue: 3,
                columns: new[] { "Email", "Password" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "Clients");
        }
    }
}
