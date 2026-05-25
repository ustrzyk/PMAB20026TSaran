using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolutionOrders.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleToWorkers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Workers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Workers",
                keyColumn: "IdWorker",
                keyValue: 1,
                column: "Role",
                value: "Worker");

            migrationBuilder.UpdateData(
                table: "Workers",
                keyColumn: "IdWorker",
                keyValue: 2,
                column: "Role",
                value: "Worker");

            migrationBuilder.UpdateData(
                table: "Workers",
                keyColumn: "IdWorker",
                keyValue: 3,
                column: "Role",
                value: "Worker");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Workers");
        }
    }
}
