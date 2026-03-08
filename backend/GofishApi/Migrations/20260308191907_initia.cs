using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GofishApi.Migrations
{
    /// <inheritdoc />
    public partial class initia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-1",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEAX5hAvRPLpUqwriJ+nw2RKiS0QWQ4R9cUl/J3uWIaVkPKsbq1CrEwJsWOU27xxTRg==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-2",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEM50a5njOnQNnSQ1tuWytSa7ZXqaJ6ljYIYaKPxRTqAqmYoENju7C6FPd04KuAuJ2A==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-3",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEI4StlQ4VT/9ZzOilc0OIRrLiyohV0Rsq7LUkImjIeHfG8PBo/8nUm/TCxVgZoiuBQ==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-4",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEH4QcqxOqOTYWyG0WhV5yFHp3AKpzlByGbic+1HqCPxlubaChK2NMmwCoGvpP4rEnw==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-5",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEEYkaM4xDd0TsVI7+9YYrb1NBy+ozLLhuEZ8iR/Y0aoMv0HbnU+1ysVtArC+MNjWYQ==");

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "Bait", "CreatedAt", "ExpiresAt", "HookSize", "Kind", "Latitude", "Longitude", "Species", "UserId", "Visibility" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.512999999999998, -8.8729999999999993, null, "seed-player-1", 0 },
                    { 2, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.513999999999996, -8.8719999999999999, null, "seed-player-2", 0 },
                    { 3, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.515000000000001, -8.8709999999999987, null, "seed-player-3", 0 },
                    { 4, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.515999999999998, -8.8699999999999992, null, "seed-player-4", 0 },
                    { 5, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.516999999999996, -8.8689999999999998, null, "seed-player-5", 0 },
                    { 6, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.518000000000001, -8.8679999999999986, null, "seed-player-1", 0 },
                    { 7, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.518999999999998, -8.8669999999999991, null, "seed-player-2", 0 },
                    { 8, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.519999999999996, -8.8659999999999997, null, "seed-player-3", 0 },
                    { 9, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.521000000000001, -8.8650000000000002, null, "seed-player-4", 0 },
                    { 10, null, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.521999999999998, -8.863999999999999, null, "seed-player-5", 0 }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "CreatedAt", "ExpiresAt", "Kind", "Latitude", "Longitude", "UserId", "Visibility", "WarningKind" },
                values: new object[,]
                {
                    { 11, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.512999999999998, -8.8729999999999993, "seed-player-1", 0, 1 },
                    { 12, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.512, -8.8719999999999999, "seed-player-2", 0, 1 },
                    { 13, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.510999999999996, -8.8709999999999987, "seed-player-3", 0, 1 },
                    { 14, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.509999999999998, -8.8699999999999992, "seed-player-4", 0, 1 },
                    { 15, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.509, -8.8689999999999998, "seed-player-5", 0, 1 },
                    { 16, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.507999999999996, -8.8679999999999986, "seed-player-1", 0, 1 },
                    { 17, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.506999999999998, -8.8669999999999991, "seed-player-2", 0, 1 },
                    { 18, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.506, -8.8659999999999997, "seed-player-3", 0, 1 },
                    { 19, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.504999999999995, -8.8650000000000002, "seed-player-4", 0, 1 },
                    { 20, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.503999999999998, -8.863999999999999, "seed-player-5", 0, 1 }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "AccessDifficulty", "CreatedAt", "ExpiresAt", "Kind", "Latitude", "Longitude", "Seabed", "UserId", "Visibility" },
                values: new object[,]
                {
                    { 21, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.512999999999998, -8.8729999999999993, 1, "seed-player-1", 0 },
                    { 22, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.513999999999996, -8.8739999999999988, 1, "seed-player-2", 0 },
                    { 23, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.515000000000001, -8.875, 1, "seed-player-3", 0 },
                    { 24, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.515999999999998, -8.8759999999999994, 1, "seed-player-4", 0 },
                    { 25, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.516999999999996, -8.8769999999999989, 1, "seed-player-5", 0 },
                    { 26, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.518000000000001, -8.8780000000000001, 1, "seed-player-1", 0 },
                    { 27, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.518999999999998, -8.8789999999999996, 1, "seed-player-2", 0 },
                    { 28, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.519999999999996, -8.879999999999999, 1, "seed-player-3", 0 },
                    { 29, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521000000000001, -8.8809999999999985, 1, "seed-player-4", 0 },
                    { 30, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 8, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521999999999998, -8.8819999999999997, 1, "seed-player-5", 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-1",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEJsatWdIgY7+V+Ru/kms3RrKK4TpUuyz1+97I5/MoE7wJIleaxl3Iz77s3AHUuZO1A==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-2",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEHOMin1Q+844zZ2444Q+Bb0Hd+7P47sDWT6s9yPQQNycD5CeGnZ4/8mrixP4RSA12g==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-3",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEMuVrTHYWABYYYs08ZwidGBOZ4SW3nm7fNHenPvt3+SxEZAMpBLMuy1tSeA+HBlezw==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-4",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEEG+BwME6W8ve6TUZu9+vRlSgCcrGV89ZoE6/CFYQ+LK8tAdp6frGFNE+7Z479ARJA==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-5",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAED49pxQ6XSAm0wjJ0XrLFoykzo8o+6l9Ng5TIo4+kCMJJbIfiqbLY2d6wWfNX+aeiQ==");
        }
    }
}
