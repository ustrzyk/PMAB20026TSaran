using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SolutionOrders.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    IdCategory = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.IdCategory);
                });

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    IdClient = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Adress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.IdClient);
                });

            migrationBuilder.CreateTable(
                name: "UnitOfMeasurements",
                columns: table => new
                {
                    IdUnitOfMeasurement = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitOfMeasurements", x => x.IdUnitOfMeasurement);
                });

            migrationBuilder.CreateTable(
                name: "Workers",
                columns: table => new
                {
                    IdWorker = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Login = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workers", x => x.IdWorker);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    IdItem = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdCategory = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdUnitOfMeasurement = table.Column<int>(type: "int", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.IdItem);
                    table.ForeignKey(
                        name: "FK_Items_Categories_IdCategory",
                        column: x => x.IdCategory,
                        principalTable: "Categories",
                        principalColumn: "IdCategory",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Items_UnitOfMeasurements_IdUnitOfMeasurement",
                        column: x => x.IdUnitOfMeasurement,
                        principalTable: "UnitOfMeasurements",
                        principalColumn: "IdUnitOfMeasurement",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    IdOrder = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DataOrder = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdClient = table.Column<int>(type: "int", nullable: true),
                    IdWorker = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveryDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.IdOrder);
                    table.ForeignKey(
                        name: "FK_Orders_Clients_IdClient",
                        column: x => x.IdClient,
                        principalTable: "Clients",
                        principalColumn: "IdClient",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_Workers_IdWorker",
                        column: x => x.IdWorker,
                        principalTable: "Workers",
                        principalColumn: "IdWorker",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    IdOrderItem = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdOrder = table.Column<int>(type: "int", nullable: false),
                    IdItem = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.IdOrderItem);
                    table.ForeignKey(
                        name: "FK_OrderItems_Items_IdItem",
                        column: x => x.IdItem,
                        principalTable: "Items",
                        principalColumn: "IdItem",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_IdOrder",
                        column: x => x.IdOrder,
                        principalTable: "Orders",
                        principalColumn: "IdOrder",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "IdCategory", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "Drukarki 3D FDM i inne urządzenia do druku przestrzennego", true, "Drukarki 3D" },
                    { 2, "Materiały eksploatacyjne do drukarek 3D, np. PLA, PET-G, TPU", true, "Filamenty" },
                    { 3, "Dysze do głowic drukarek 3D w różnych rozmiarach", true, "Dysze" },
                    { 4, "Powierzchnie robocze, nakładki PEI i akcesoria do stołów", true, "Stoły robocze" },
                    { 5, "Części zamienne i podzespoły do drukarek 3D", true, "Części" },
                    { 6, "Narzędzia serwisowe i akcesoria pomocnicze", true, "Narzędzia" }
                });

            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "IdClient", "Adress", "IsActive", "Name", "PhoneNumber" },
                values: new object[,]
                {
                    { 1, "ul. Główna 1, Warszawa", true, "Jan Kowalski", "500-100-200" },
                    { 2, "ul. Kwiatowa 5, Kraków", true, "Anna Nowak", "600-200-300" },
                    { 3, "ul. Leśna 12, Gdańsk", true, "Marek Wiśniewski", "700-300-400" }
                });

            migrationBuilder.InsertData(
                table: "UnitOfMeasurements",
                columns: new[] { "IdUnitOfMeasurement", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "Sztuki", true, "szt" },
                    { 2, "Kilogramy", true, "kg" },
                    { 3, "Metry", true, "m" }
                });

            migrationBuilder.InsertData(
                table: "Workers",
                columns: new[] { "IdWorker", "FirstName", "IsActive", "LastName", "Login", "Password" },
                values: new object[,]
                {
                    { 1, "Piotr", true, "Kowalczyk", "pkowalczyk", "haslo123" },
                    { 2, "Maria", true, "Wiśniewska", "mwisniewska", "haslo456" },
                    { 3, "Tomasz", true, "Zieliński", "tzielinski", "haslo789" }
                });

            migrationBuilder.InsertData(
                table: "Items",
                columns: new[] { "IdItem", "Code", "Description", "FotoUrl", "IdCategory", "IdUnitOfMeasurement", "IsActive", "Name", "Price", "Quantity" },
                values: new object[,]
                {
                    { 1, "PRN001", "Popularna drukarka 3D FDM, idealna dla początkujących.", null, 1, 1, true, "Creality Ender 3 V3 SE", 1099m, 12m },
                    { 2, "PRN002", "Kompaktowa i szybka drukarka 3D do zastosowań domowych.", null, 1, 1, true, "Bambu Lab A1 Mini", 1499m, 8m },
                    { 3, "PRN003", "Nowoczesna drukarka 3D z automatycznym poziomowaniem stołu.", null, 1, 1, true, "Anycubic Kobra 2 Neo", 1299m, 6m },
                    { 4, "FIL001", "Uniwersalny filament PLA do codziennych wydruków.", null, 2, 1, true, "Filament PLA Black 1kg", 79m, 40m },
                    { 5, "FIL002", "Wytrzymały filament PET-G do bardziej wymagających projektów.", null, 2, 1, true, "Filament PET-G White 1kg", 89m, 25m },
                    { 6, "FIL003", "Elastyczny filament TPU do specjalistycznych wydruków.", null, 2, 1, true, "Filament TPU Flexible 1kg", 119m, 15m },
                    { 7, "NOZ001", "Standardowa mosiężna dysza 0.4 mm do drukarki 3D.", null, 3, 1, true, "Dysza 0.4 mm Brass", 15m, 100m },
                    { 8, "NOZ002", "Komplet dysz o różnych średnicach do precyzyjnych wydruków.", null, 3, 1, true, "Zestaw dysz 0.2 / 0.4 / 0.6 / 0.8 mm", 39m, 40m },
                    { 9, "BED001", "Elastyczna powierzchnia robocza PEI do drukarek 3D.", null, 4, 1, true, "Płyta PEI 235x235 mm", 89m, 20m },
                    { 10, "BED002", "Gładka powierzchnia robocza do stołu drukarki 3D.", null, 4, 1, true, "Szkło hartowane 235x235 mm", 49m, 18m },
                    { 11, "PRT001", "Wzmocniony ekstruder do popularnych drukarek 3D.", null, 5, 1, true, "Ekstruder metalowy MK8", 59m, 30m },
                    { 12, "PRT002", "Pasek napędowy GT2 do osi drukarki 3D.", null, 5, 1, true, "Pasek GT2 5m", 25m, 22m },
                    { 13, "TLS001", "Narzędzia do serwisu i wykańczania wydruków 3D.", null, 6, 1, true, "Zestaw kluczy i szczypiec do druku 3D", 45m, 35m },
                    { 14, "TLS002", "Akcesorium pomocne przy zdejmowaniu modeli ze stołu.", null, 6, 1, true, "Szpachelka do zdejmowania wydruków", 19m, 50m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Items_IdCategory",
                table: "Items",
                column: "IdCategory");

            migrationBuilder.CreateIndex(
                name: "IX_Items_IdUnitOfMeasurement",
                table: "Items",
                column: "IdUnitOfMeasurement");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_IdItem",
                table: "OrderItems",
                column: "IdItem");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_IdOrder",
                table: "OrderItems",
                column: "IdOrder");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_IdClient",
                table: "Orders",
                column: "IdClient");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_IdWorker",
                table: "Orders",
                column: "IdWorker");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "UnitOfMeasurements");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Workers");
        }
    }
}
