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
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TwoFactorMethod = table.Column<int>(type: "int", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Friendships",
                columns: table => new
                {
                    RequesterUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ReceiverUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    State = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RepliedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friendships", x => new { x.RequesterUserId, x.ReceiverUserId });
                    table.ForeignKey(
                        name: "FK_Friendships_AspNetUsers_ReceiverUserId",
                        column: x => x.ReceiverUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Friendships_AspNetUsers_RequesterUserId",
                        column: x => x.RequesterUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Visibility = table.Column<int>(type: "int", nullable: false),
                    Kind = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    HookSize = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    Species = table.Column<int>(type: "int", nullable: true),
                    Bait = table.Column<int>(type: "int", nullable: true),
                    AccessDifficulty = table.Column<int>(type: "int", nullable: true),
                    Seabed = table.Column<int>(type: "int", nullable: true),
                    WarningKind = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpVotes = table.Column<int>(type: "int", nullable: false),
                    DownVotes = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Posts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Posts_Pins_Id",
                        column: x => x.Id,
                        principalTable: "Pins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "FirstName", "LastName", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "TwoFactorMethod", "UserName" },
                values: new object[,]
                {
                    { "seed-player-1", 0, "seed-cstamp-1", "player1@gofish.com", true, null, null, false, null, "PLAYER1@GOFISH.COM", "PLAYER1", "AQAAAAIAAYagAAAAEObobIHg0KTHCcaY4rIBWMuYcpJbxNUkJCkCyFj8wMpRiR7Ag489GEUt1hbrEfK1+w==", null, false, "seed-stamp-1", false, 0, "player1" },
                    { "seed-player-2", 0, "seed-cstamp-2", "player2@gofish.com", true, null, null, false, null, "PLAYER2@GOFISH.COM", "PLAYER2", "AQAAAAIAAYagAAAAEH+2TxC0mag8qDxDu1Mrnwmkj5dUGC3TEOxVwG+tThaBmoNhX35lXxAAej6oYjrkPw==", null, false, "seed-stamp-2", false, 0, "player2" },
                    { "seed-player-3", 0, "seed-cstamp-3", "player3@gofish.com", true, null, null, false, null, "PLAYER3@GOFISH.COM", "PLAYER3", "AQAAAAIAAYagAAAAEJM+iCjFW4GUDA2YwMOhpLjycxC12q+rn7ivD2iO4bQJIDy7rM6VCM992iySVVVe+g==", null, false, "seed-stamp-3", false, 0, "player3" },
                    { "seed-player-4", 0, "seed-cstamp-4", "player4@gofish.com", true, null, null, false, null, "PLAYER4@GOFISH.COM", "PLAYER4", "AQAAAAIAAYagAAAAEGKgJMS7aoCO1x06jXQ4DEBkADprZA/5eIeAXmmRfuSHXp4lr9ZCVPXZlJ6iX/CuZQ==", null, false, "seed-stamp-4", false, 0, "player4" },
                    { "seed-player-5", 0, "seed-cstamp-5", "player5@gofish.com", true, null, null, false, null, "PLAYER5@GOFISH.COM", "PLAYER5", "AQAAAAIAAYagAAAAEKLL5R96wqZkhjsz8FH8W3XWawLWmK5t/1BHmkN6+Nqs5gv0Eo1+hwNXkPGScSkpGQ==", null, false, "seed-stamp-5", false, 0, "player5" }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "Bait", "CreatedAt", "ExpiresAt", "HookSize", "Kind", "Latitude", "Longitude", "Species", "UserId", "Visibility" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.512999999999998, -8.8729999999999993, 1, "seed-player-1", 0 },
                    { 2, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.515000000000001, -8.8719999999999999, 1, "seed-player-2", 0 },
                    { 3, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.516999999999996, -8.8689999999999998, 1, "seed-player-3", 0 },
                    { 4, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.527999999999999, -8.8669999999999991, 1, "seed-player-4", 0 },
                    { 5, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.516999999999996, -8.8529999999999998, 1, "seed-player-5", 0 },
                    { 6, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.537999999999997, -8.8629999999999995, 1, "seed-player-1", 0 },
                    { 7, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.536999999999999, -8.8549999999999986, 1, "seed-player-2", 0 },
                    { 8, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.519999999999996, -8.8519999999999985, 1, "seed-player-3", 0 },
                    { 9, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.528999999999996, -8.8330000000000002, 1, "seed-player-4", 0 },
                    { 10, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.539999999999999, -8.863999999999999, 1, "seed-player-5", 0 }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "CreatedAt", "ExpiresAt", "Kind", "Latitude", "Longitude", "UserId", "Visibility", "WarningKind" },
                values: new object[,]
                {
                    { 11, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.512999999999998, -8.8729999999999993, "seed-player-1", 0, 1 },
                    { 12, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.510999999999996, -8.8699999999999992, "seed-player-2", 0, 1 },
                    { 13, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.503, -8.8689999999999998, "seed-player-3", 0, 1 },
                    { 14, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.497999999999998, -8.8699999999999992, "seed-player-4", 0, 1 },
                    { 15, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.500999999999998, -8.8529999999999998, "seed-player-5", 0, 1 },
                    { 16, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.497999999999998, -8.847999999999999, "seed-player-1", 0, 1 },
                    { 17, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.488999999999997, -8.8609999999999989, "seed-player-2", 0, 1 },
                    { 18, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.484999999999999, -8.859, "seed-player-3", 0, 1 },
                    { 19, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.472999999999999, -8.8409999999999993, "seed-player-4", 0, 1 },
                    { 20, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.485999999999997, -8.863999999999999, "seed-player-5", 0, 1 }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "AccessDifficulty", "CreatedAt", "ExpiresAt", "Kind", "Latitude", "Longitude", "Seabed", "UserId", "Visibility" },
                values: new object[,]
                {
                    { 21, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.512999999999998, -8.8729999999999993, 1, "seed-player-1", 0 },
                    { 22, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.513999999999996, -8.8759999999999994, 1, "seed-player-2", 0 },
                    { 23, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521000000000001, -8.8789999999999996, 1, "seed-player-3", 0 },
                    { 24, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521999999999998, -8.8759999999999994, 1, "seed-player-4", 0 },
                    { 25, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521000000000001, -8.8809999999999985, 1, "seed-player-5", 0 },
                    { 26, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.537999999999997, -8.8929999999999989, 1, "seed-player-1", 0 },
                    { 27, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.542999999999999, -8.9029999999999987, 1, "seed-player-2", 0 },
                    { 28, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.519999999999996, -8.8869999999999987, 1, "seed-player-3", 0 },
                    { 29, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.544999999999995, -8.9129999999999985, 1, "seed-player-4", 0 },
                    { 30, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.539999999999999, -8.9089999999999989, 1, "seed-player-5", 0 }
                });

            migrationBuilder.InsertData(
                table: "Posts",
                columns: new[] { "Id", "Body", "CreatedAt", "DownVotes", "ImageUrl", "UpVotes", "UserId" },
                values: new object[,]
                {
                    { 1, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-1" },
                    { 2, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-2" },
                    { 3, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-3" },
                    { 4, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-4" },
                    { 5, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-5" },
                    { 6, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-1" },
                    { 7, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-2" },
                    { 8, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-3" },
                    { 9, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-4" },
                    { 10, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, "https://gofishstorage.blob.core.windows.net/post-images/0091b5cc-a77a-4b77-bb6d-c01d23b23ab5.png", 0, "seed-player-5" },
                    { 11, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 12, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 13, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 14, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 15, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" },
                    { 16, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 17, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 18, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 19, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 20, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" },
                    { 21, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 22, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 23, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 24, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 25, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" },
                    { 26, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 27, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 28, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 29, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 30, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_ReceiverUserId",
                table: "Friendships",
                column: "ReceiverUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Pins_ExpiresAt_CreatedAt",
                table: "Pins",
                columns: new[] { "ExpiresAt", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Pins_Latitude_Longitude",
                table: "Pins",
                columns: new[] { "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_Pins_UserId",
                table: "Pins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_UserId",
                table: "Posts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Friendships");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Pins");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
