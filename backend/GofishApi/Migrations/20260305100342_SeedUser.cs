using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GofishApi.Migrations
{
    /// <inheritdoc />
    public partial class SeedUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "FirstName", "LastName", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "TwoFactorMethod", "UserName" },
                values: new object[,]
                {
                    { "seed-player-1", 0, "seed-cstamp-1", "player1@gofish.com", true, null, null, false, null, "PLAYER1@GOFISH.COM", "PLAYER1", "AQAAAAIAAYagAAAAEJsatWdIgY7+V+Ru/kms3RrKK4TpUuyz1+97I5/MoE7wJIleaxl3Iz77s3AHUuZO1A==", null, false, "seed-stamp-1", false, 0, "player1" },
                    { "seed-player-2", 0, "seed-cstamp-2", "player2@gofish.com", true, null, null, false, null, "PLAYER2@GOFISH.COM", "PLAYER2", "AQAAAAIAAYagAAAAEHOMin1Q+844zZ2444Q+Bb0Hd+7P47sDWT6s9yPQQNycD5CeGnZ4/8mrixP4RSA12g==", null, false, "seed-stamp-2", false, 0, "player2" },
                    { "seed-player-3", 0, "seed-cstamp-3", "player3@gofish.com", true, null, null, false, null, "PLAYER3@GOFISH.COM", "PLAYER3", "AQAAAAIAAYagAAAAEMuVrTHYWABYYYs08ZwidGBOZ4SW3nm7fNHenPvt3+SxEZAMpBLMuy1tSeA+HBlezw==", null, false, "seed-stamp-3", false, 0, "player3" },
                    { "seed-player-4", 0, "seed-cstamp-4", "player4@gofish.com", true, null, null, false, null, "PLAYER4@GOFISH.COM", "PLAYER4", "AQAAAAIAAYagAAAAEEG+BwME6W8ve6TUZu9+vRlSgCcrGV89ZoE6/CFYQ+LK8tAdp6frGFNE+7Z479ARJA==", null, false, "seed-stamp-4", false, 0, "player4" },
                    { "seed-player-5", 0, "seed-cstamp-5", "player5@gofish.com", true, null, null, false, null, "PLAYER5@GOFISH.COM", "PLAYER5", "AQAAAAIAAYagAAAAED49pxQ6XSAm0wjJ0XrLFoykzo8o+6l9Ng5TIo4+kCMJJbIfiqbLY2d6wWfNX+aeiQ==", null, false, "seed-stamp-5", false, 0, "player5" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-1");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-2");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-3");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-4");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-5");
        }
    }
}
