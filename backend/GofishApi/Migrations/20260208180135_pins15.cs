using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GofishApi.Migrations
{
    /// <inheritdoc />
    public partial class pins15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatchPins");

            migrationBuilder.DropTable(
                name: "InfoPins");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WarnPins",
                table: "WarnPins");

            migrationBuilder.RenameTable(
                name: "WarnPins",
                newName: "Pins");

            migrationBuilder.AddColumn<int>(
                name: "AccessDifficulty",
                table: "Pins",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BaitType",
                table: "Pins",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "Pins",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HookSize",
                table: "Pins",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Pins",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeaBedType",
                table: "Pins",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SpeciesType",
                table: "Pins",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pins",
                table: "Pins",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Pins_ExpiresAt_CreatedAt",
                table: "Pins",
                columns: new[] { "ExpiresAt", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Pins_Latitude_Longitude",
                table: "Pins",
                columns: new[] { "Latitude", "Longitude" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Pins",
                table: "Pins");

            migrationBuilder.DropIndex(
                name: "IX_Pins_ExpiresAt_CreatedAt",
                table: "Pins");

            migrationBuilder.DropIndex(
                name: "IX_Pins_Latitude_Longitude",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "AccessDifficulty",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "BaitType",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "HookSize",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "SeaBedType",
                table: "Pins");

            migrationBuilder.DropColumn(
                name: "SpeciesType",
                table: "Pins");

            migrationBuilder.RenameTable(
                name: "Pins",
                newName: "WarnPins");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WarnPins",
                table: "WarnPins",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "CatchPins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BaitType = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HookSize = table.Column<int>(type: "int", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    PinType = table.Column<int>(type: "int", nullable: false),
                    SpeciesType = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatchPins", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InfoPins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccessDifficulty = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    PinType = table.Column<int>(type: "int", nullable: false),
                    SeaBedType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InfoPins", x => x.Id);
                });
        }
    }
}
