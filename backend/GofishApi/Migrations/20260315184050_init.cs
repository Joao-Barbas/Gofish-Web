using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GofishApi.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-1",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEK65oD4z82Q4yacVAjgCOoxyHyG4wOCLdo21Ay6q2S40gN080QumzqN4sn7USyDosQ==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-2",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEGOHm1WxyZ6pF0UKd6E3UiSlNaJ4sldc4FHUW7anGyT04mBGx/3sdmHG7yS9+nHK5g==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-3",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEPQjgknmCUxZQeBallO/scAuSlOpeIs0xV5QLuZ8HcC0We1d3xrKyl5aVfa8H9raBQ==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-4",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEBTkA87xM24xWJDhNTz5kFW4RjXtlLK404UZJ5jfz6EYWfRYt0VcCO4PQDG/d4VhsQ==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-5",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEMGbS6g/b1iNDKLYYkM7B630jjgMtz2dMlAaUBERItEQyNJEieZ39/DU8LSMyZCm5Q==");

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 2,
                column: "Longitude",
                value: -8.8689999999999998);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.516999999999996, -8.8709999999999987 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.521999999999998, -8.8609999999999989 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 5,
                column: "Longitude",
                value: -8.8569999999999993);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 6,
                column: "Longitude",
                value: -8.8529999999999998);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.542999999999999, -8.8490000000000002 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.540999999999997, -8.859 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 9,
                column: "Longitude",
                value: -8.8490000000000002);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.521999999999998, -8.8279999999999994 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.518000000000001, -8.8759999999999994 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 103,
                column: "Latitude",
                value: 38.516999999999996);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.518999999999998, -8.8879999999999999 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.516999999999996, -8.8929999999999989 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.518000000000001, -8.8929999999999989 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 107,
                column: "Latitude",
                value: 38.524999999999999);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 108,
                column: "Latitude",
                value: 38.547999999999995);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 109,
                column: "Longitude",
                value: -8.8969999999999985);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 110,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.548999999999999, -8.9179999999999993 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.510999999999996, -8.8709999999999987 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.510999999999996, -8.8650000000000002 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 204,
                column: "Latitude",
                value: 38.503999999999998);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 205,
                column: "Latitude",
                value: 38.509);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 206,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.492999999999995, -8.8579999999999988 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 207,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.494999999999997, -8.8549999999999986 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 208,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.491999999999997, -8.859 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 209,
                column: "Longitude",
                value: -8.8330000000000002);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 210,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.494999999999997, -8.8549999999999986 });

            migrationBuilder.InsertData(
                table: "UserProfiles",
                columns: new[] { "UserId", "AvatarUrl", "Bio", "FishingScore", "JoinedAt", "LastActiveAt", "LastUpdateAt" },
                values: new object[,]
                {
                    { "seed-player-1", null, null, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "seed-player-2", null, null, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "seed-player-3", null, null, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "seed-player-4", null, null, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "seed-player-5", null, null, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "UserId",
                keyValue: "seed-player-1");

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "UserId",
                keyValue: "seed-player-2");

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "UserId",
                keyValue: "seed-player-3");

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "UserId",
                keyValue: "seed-player-4");

            migrationBuilder.DeleteData(
                table: "UserProfiles",
                keyColumn: "UserId",
                keyValue: "seed-player-5");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-1",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEIJ918+RzNyXMgAKlZhpAxNG++Jv55Cx1SivLxHVc9jOqFnua9RLeZ2pW/SX45Qa4w==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-2",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAENjlbsZPg+DHP3kO4iaDZo6L0aU9tRcrvdgm4JSQ9D9RWlSjp+f/VH2eAngDsN9uWw==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-3",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEFM6frO/+V6ljDMbH07ZDovvlQH51iXZkAoH5K8ki/Cuv0+lLFcmRe1bxI9z553hCg==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-4",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEO1lUgzFV0SVXnq7eX3SZgExP9K8q//rVQKXXTGFcf1LS9kLt6JpZCPtZi9YbDRrMQ==");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "seed-player-5",
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEEG5Bd2Yl+cfzOJbjV/V9WWhf7X5i2ReBVNKAiMfrhpkXt3PkRksB8Rm8TBkv8bu6A==");

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 2,
                column: "Longitude",
                value: -8.8719999999999999);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.518999999999998, -8.8650000000000002 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.524999999999999, -8.863999999999999 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 5,
                column: "Longitude",
                value: -8.8529999999999998);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 6,
                column: "Longitude",
                value: -8.8629999999999995);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.518999999999998, -8.843 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.519999999999996, -8.8519999999999985 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 9,
                column: "Longitude",
                value: -8.8569999999999993);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.558, -8.8460000000000001 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 102,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.515999999999998, -8.8739999999999988 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 103,
                column: "Latitude",
                value: 38.522999999999996);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 104,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.524999999999999, -8.8819999999999997 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 105,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.524999999999999, -8.8849999999999998 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 106,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.537999999999997, -8.8879999999999999 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 107,
                column: "Latitude",
                value: 38.518999999999998);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 108,
                column: "Latitude",
                value: 38.533999999999999);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 109,
                column: "Longitude",
                value: -8.9049999999999994);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 110,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.539999999999999, -8.891 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 202,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.512, -8.8719999999999999 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 203,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.503, -8.8629999999999995 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 204,
                column: "Latitude",
                value: 38.500999999999998);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 205,
                column: "Latitude",
                value: 38.504999999999995);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 206,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.497999999999998, -8.8679999999999986 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 207,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.482999999999997, -8.8609999999999989 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 208,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.478000000000002, -8.8379999999999992 });

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 209,
                column: "Longitude",
                value: -8.8409999999999993);

            migrationBuilder.UpdateData(
                table: "Pins",
                keyColumn: "Id",
                keyValue: 210,
                columns: new[] { "Latitude", "Longitude" },
                values: new object[] { 38.476999999999997, -8.8279999999999994 });
        }
    }
}
