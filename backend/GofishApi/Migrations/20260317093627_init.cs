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
                name: "GroupRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
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
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FishingScore = table.Column<int>(type: "int", nullable: false),
                    LastUpdateAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastActiveAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroupUsers",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupUsers", x => new { x.UserId, x.GroupId });
                    table.ForeignKey(
                        name: "FK_GroupUsers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupUsers_GroupRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "GroupRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupUsers_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
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

            migrationBuilder.CreateTable(
                name: "GroupPosts",
                columns: table => new
                {
                    PostId = table.Column<int>(type: "int", nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupPosts", x => new { x.PostId, x.GroupId });
                    table.ForeignKey(
                        name: "FK_GroupPosts_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupPosts_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostComments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Body = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PostId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PostId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostComments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PostComments_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PostComments_Posts_PostId1",
                        column: x => x.PostId1,
                        principalTable: "Posts",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "FirstName", "LastName", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "TwoFactorMethod", "UserName" },
                values: new object[,]
                {
                    { "seed-player-1", 0, "seed-cstamp-1", "player1@gofish.com", true, null, null, false, null, "PLAYER1@GOFISH.COM", "PLAYER1", "AQAAAAIAAYagAAAAECtYJc/wjaNMXy+VCBHDIZWXvTYNb0zSpHDlvSoDDGEWCtEvd/7S+zvutWWtJ2Mbuw==", null, false, "seed-stamp-1", false, 0, "player1" },
                    { "seed-player-2", 0, "seed-cstamp-2", "player2@gofish.com", true, null, null, false, null, "PLAYER2@GOFISH.COM", "PLAYER2", "AQAAAAIAAYagAAAAEN6cNMsErzZ1yLQRZK2pYBM+tpdGbjGhkueqgZlUSO2mWMgVAmvyS6/JIKGN4wkZyQ==", null, false, "seed-stamp-2", false, 0, "player2" },
                    { "seed-player-3", 0, "seed-cstamp-3", "player3@gofish.com", true, null, null, false, null, "PLAYER3@GOFISH.COM", "PLAYER3", "AQAAAAIAAYagAAAAEBYqGnqtHfjaNxcPbxX7cl2h97DipcIvgWRTzy8Q+VO8c/0orT1uXDyXruNm01xEBw==", null, false, "seed-stamp-3", false, 0, "player3" },
                    { "seed-player-4", 0, "seed-cstamp-4", "player4@gofish.com", true, null, null, false, null, "PLAYER4@GOFISH.COM", "PLAYER4", "AQAAAAIAAYagAAAAEL856ISuAioWesgBhM+i2n4R4z61Q7QwcJM0MIoo2ePAAcDcrd7Hc/eRK6HIskl11g==", null, false, "seed-stamp-4", false, 0, "player4" },
                    { "seed-player-5", 0, "seed-cstamp-5", "player5@gofish.com", true, null, null, false, null, "PLAYER5@GOFISH.COM", "PLAYER5", "AQAAAAIAAYagAAAAELLY6DDs6JITTdU2Gqj/ilKcK1YOOpq9QtOSC+nKOjQEHzUIQJUFIV4GYAQdroyC5A==", null, false, "seed-stamp-5", false, 0, "player5" }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "Bait", "CreatedAt", "ExpiresAt", "HookSize", "Kind", "Latitude", "Longitude", "Species", "UserId", "Visibility" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.512999999999998, -8.8729999999999993, 1, "seed-player-1", 0 },
                    { 2, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.513999999999996, -8.8699999999999992, 1, "seed-player-2", 0 },
                    { 3, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.521000000000001, -8.8629999999999995, 1, "seed-player-3", 0 },
                    { 4, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.515999999999998, -8.8669999999999991, 1, "seed-player-4", 0 },
                    { 5, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.516999999999996, -8.8689999999999998, 1, "seed-player-5", 0 },
                    { 6, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.522999999999996, -8.847999999999999, 1, "seed-player-1", 0 },
                    { 7, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.542999999999999, -8.843, 1, "seed-player-2", 0 },
                    { 8, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.527000000000001, -8.859, 1, "seed-player-3", 0 },
                    { 9, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.552999999999997, -8.8409999999999993, 1, "seed-player-4", 0 },
                    { 10, 1, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), null, 0, 38.530999999999999, -8.863999999999999, 1, "seed-player-5", 0 }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "AccessDifficulty", "CreatedAt", "ExpiresAt", "Kind", "Latitude", "Longitude", "Seabed", "UserId", "Visibility" },
                values: new object[,]
                {
                    { 101, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.512999999999998, -8.8729999999999993, 1, "seed-player-1", 0 },
                    { 102, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.513999999999996, -8.8769999999999989, 1, "seed-player-2", 0 },
                    { 103, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.515000000000001, -8.8789999999999996, 1, "seed-player-3", 0 },
                    { 104, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.524999999999999, -8.8849999999999998, 1, "seed-player-4", 0 },
                    { 105, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521000000000001, -8.8849999999999998, 1, "seed-player-5", 0 },
                    { 106, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.533000000000001, -8.8929999999999989, 1, "seed-player-1", 0 },
                    { 107, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.536999999999999, -8.9029999999999987, 1, "seed-player-2", 0 },
                    { 108, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.527000000000001, -8.8940000000000001, 1, "seed-player-3", 0 },
                    { 109, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.544999999999995, -8.9129999999999985, 1, "seed-player-4", 0 },
                    { 110, 0, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 1, 38.521999999999998, -8.9089999999999989, 1, "seed-player-5", 0 }
                });

            migrationBuilder.InsertData(
                table: "Pins",
                columns: new[] { "Id", "CreatedAt", "ExpiresAt", "Kind", "Latitude", "Longitude", "UserId", "Visibility", "WarningKind" },
                values: new object[,]
                {
                    { 201, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.512999999999998, -8.8729999999999993, "seed-player-1", 0, 1 },
                    { 202, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.512, -8.8719999999999999, "seed-player-2", 0, 1 },
                    { 203, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.503, -8.8689999999999998, "seed-player-3", 0, 1 },
                    { 204, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.497999999999998, -8.8669999999999991, "seed-player-4", 0, 1 },
                    { 205, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.509, -8.8569999999999993, "seed-player-5", 0, 1 },
                    { 206, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.497999999999998, -8.8679999999999986, "seed-player-1", 0, 1 },
                    { 207, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.494999999999997, -8.8669999999999991, "seed-player-2", 0, 1 },
                    { 208, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.478000000000002, -8.8659999999999997, "seed-player-3", 0, 1 },
                    { 209, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.488999999999997, -8.8409999999999993, "seed-player-4", 0, 1 },
                    { 210, new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 11, 12, 0, 0, 0, DateTimeKind.Utc), 2, 38.467999999999996, -8.8279999999999994, "seed-player-5", 0, 1 }
                });

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
                    { 101, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 102, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 103, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 104, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 105, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" },
                    { 106, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 107, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 108, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 109, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 110, "body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" },
                    { 201, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 202, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 203, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 204, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 205, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" },
                    { 206, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-1" },
                    { 207, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-2" },
                    { 208, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-3" },
                    { 209, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-4" },
                    { 210, "Body", new DateTime(2026, 3, 1, 12, 0, 0, 0, DateTimeKind.Utc), 0, null, 0, "seed-player-5" }
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
                name: "IX_GroupPosts_GroupId",
                table: "GroupPosts",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupUsers_GroupId",
                table: "GroupUsers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupUsers_RoleId",
                table: "GroupUsers",
                column: "RoleId");

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
                name: "IX_PostComments_PostId",
                table: "PostComments",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_PostComments_PostId1",
                table: "PostComments",
                column: "PostId1");

            migrationBuilder.CreateIndex(
                name: "IX_PostComments_UserId",
                table: "PostComments",
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
                name: "GroupPosts");

            migrationBuilder.DropTable(
                name: "GroupUsers");

            migrationBuilder.DropTable(
                name: "PostComments");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "GroupRoles");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "Pins");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
