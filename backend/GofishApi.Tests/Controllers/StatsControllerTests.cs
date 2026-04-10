using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Tests.Fixtures;
using GofishApi.Tests.Fixtutes;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using GofishApi.Models;
using GofishApi.Enums;
using Microsoft.AspNetCore.Http.HttpResults;

namespace GofishApi.Tests.Controllers;

public class StatsControllerTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;


    public StatsControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    [Fact]
    public async Task GetPinsCreatedToday_ShouldReturn_Ok_And_Correct_Value()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        var midToday = now.Date.AddHours(12); // Noon UTC today, safely inside the day

        await PinSeedFixture.CreateInfoPinAsync(db, createdAt: midToday);
        await PinSeedFixture.CreateWarnPinAsync(db, createdAt: midToday.AddMinutes(-30));
        await PinSeedFixture.CreateCatchPinAsync(db, createdAt: now.Date.AddDays(-1).AddHours(12));

        var response = await _client.GetAsync("/api/Stats/GetPinsCreatedToday");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<GetPinsCreatedTodayResDTO>();
        Assert.NotNull(dto);
        Assert.Equal(2, dto!.PinsCreatedToday);
    }

    [Fact]
    public async Task GetReportsWaitingReview_ShouldReturn_Ok_And_Total_Reports()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var pin1 = await PinSeedFixture.CreateInfoPinAsync(db);
        var pin2 = await PinSeedFixture.CreateWarnPinAsync(db);

        db.PinReports.AddRange(
            new PinReport
            {
                UserId = "test-user-id",
                PinId = pin1.Id,
                Reason = PinReportReason.Spam,
                CreatedAt = DateTime.UtcNow
            },
            new PinReport
            {
                UserId = "test-user-id",
                PinId = pin2.Id,
                Reason = PinReportReason.DuplicatePin,
                CreatedAt = DateTime.UtcNow
            });

        var comment1 = new Comment
        {
            UserId = "test-user-id",
            PinId = pin1.Id,
            Body = "Comentário 1",
            CreatedAt = DateTime.UtcNow
        };

        var comment2 = new Comment
        {
            UserId = "test-user-id",
            PinId = pin1.Id,
            Body = "Comentário 2",
            CreatedAt = DateTime.UtcNow
        };

        var comment3 = new Comment
        {
            UserId = "test-user-id",
            PinId = pin2.Id,
            Body = "Comentário 3",
            CreatedAt = DateTime.UtcNow
        };

        db.Comments.AddRange(comment1, comment2, comment3);
        await db.SaveChangesAsync();

        db.CommentReports.AddRange(
            new CommentReport
            {
                UserId = "test-user-id",
                CommentId = comment1.Id,
                Reason = CommentReportReason.Spam,
                CreatedAt = DateTime.UtcNow
            },
            new CommentReport
            {
                UserId = "test-user-id",
                CommentId = comment2.Id,
                Reason = CommentReportReason.OffTopic,
                CreatedAt = DateTime.UtcNow
            },
            new CommentReport
            {
                UserId = "test-user-id",
                CommentId = comment3.Id,
                Reason = CommentReportReason.Harassment,
                CreatedAt = DateTime.UtcNow
            });

        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/Stats/GetReportsWaitingReview");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<GetReportsWaitingReviewResDTO>();
        Assert.NotNull(dto);
        Assert.Equal(5, dto!.ReportsWaitingReview);
    }

    [Fact]
    public async Task GetActiveUsers_ShouldReturn_Ok_And_Distinct_Users_From_Last_30_Days()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await PinSeedFixture.CreateInfoPinAsync(
            db,
            userId: "test-user-id",
            createdAt: DateTime.UtcNow.AddDays(-5));

        await PinSeedFixture.CreateWarnPinAsync(
            db,
            userId: "test-user-id",
            createdAt: DateTime.UtcNow.AddDays(-3));

        var user2 = new AppUser
        {
            Id = "user-2",
            Email = "user2@test.com",
            UserName = "user2",
            FirstName = "User",
            LastName = "Two",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user2);
        await db.SaveChangesAsync();

        await PinSeedFixture.CreateCatchPinAsync(
            db,
            userId: "user-2",
            createdAt: DateTime.UtcNow.AddDays(-10));

        var user3 = new AppUser
        {
            Id = "user-3",
            Email = "user3@test.com",
            UserName = "user3",
            FirstName = "User",
            LastName = "Three",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user3);
        await db.SaveChangesAsync();

        await PinSeedFixture.CreateInfoPinAsync(
            db,
            userId: "user-3",
            createdAt: DateTime.UtcNow.AddDays(-31));

        var response = await _client.GetAsync("/api/Stats/GetActiveUsers");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dto = await response.Content.ReadFromJsonAsync<GetActiveUsersResDTO>();
        Assert.NotNull(dto);
        Assert.Equal(2, dto!.ActiveUsers);
    }

    [Fact]
    public async Task GetPinsWith15PositiveVotes_ShouldReturn_Ok_And_Correct_Value()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var pin1 = await PinSeedFixture.CreateInfoPinAsync(db);
        var pin2 = await PinSeedFixture.CreateWarnPinAsync(db);

        for (int i = 0; i < 15; i++)
        {
            var user = new AppUser
            {
                Id = $"vote-user-{i}",
                Email = $"vote{i}@test.com",
                UserName = $"voteuser{i}",
                FirstName = "Vote",
                LastName = $"User{i}",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
        }

        for (int i = 15; i < 29; i++)
        {
            var user = new AppUser
            {
                Id = $"vote-user-{i}",
                Email = $"vote{i}@test.com",
                UserName = $"voteuser{i}",
                FirstName = "Vote",
                LastName = $"User{i}",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
        }

        await db.SaveChangesAsync();

        for (int i = 0; i < 15; i++)
        {
            db.Votes.Add(new Vote
            {
                CreatedAt = DateTime.UtcNow,
                PinId = pin1.Id,
                UserId = $"vote-user-{i}",
                Value = VoteKind.Upvote
            });
        }

        for (int i = 15; i < 29; i++)
        {
            db.Votes.Add(new Vote
            {
                CreatedAt = DateTime.UtcNow,
                PinId = pin2.Id,
                UserId = $"vote-user-{i}",
                Value = VoteKind.Upvote
            });
        }

        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/Stats/GetPinsWith15PositiveVotes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<GetPinsWith15PositiveVotesResDTO>();
        Assert.NotNull(dto);
        Assert.Equal(1, dto!.PinsWith15PositiveVotes);
    }

    [Fact]
    public async Task GetWeeklyApiSuccessRate_ShouldReturn_Ok_And_Correct_Rate()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.RequestLogs.AddRange(
            new RequestLogs
            {
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                StatusCode = 200
            },
            new RequestLogs
            {
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                StatusCode = 201
            },
            new RequestLogs
            {
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                StatusCode = 400
            },
            new RequestLogs
            {
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                StatusCode = 500
            },
            new RequestLogs
            {
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                StatusCode = 200
            });

        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/Stats/GetWeeklyApiSuccessRate");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<GetSuccessRateOfRequestsDTO>();
        Assert.NotNull(dto);
        Assert.Equal(50, dto!.SuccessRateOfRequests);
    }

    [Fact]
    public async Task GetNewUsersToday_ShouldReturn_Ok_And_Correct_Value()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        var midToday = now.Date.AddHours(12);

        db.Users.AddRange(
            new AppUser
            {
                Id = "new-user-1",
                Email = "new1@test.com",
                UserName = "newuser1",
                FirstName = "New",
                LastName = "User1",
                EmailConfirmed = true,
                CreatedAt = midToday
            },
            new AppUser
            {
                Id = "new-user-2",
                Email = "new2@test.com",
                UserName = "newuser2",
                FirstName = "New",
                LastName = "User2",
                EmailConfirmed = true,
                CreatedAt = midToday.AddMinutes(-30)
            });

        db.Users.Add(
            new AppUser
            {
                Id = "old-user",
                Email = "old@test.com",
                UserName = "olduser",
                FirstName = "Old",
                LastName = "User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow.Date.AddDays(-1).AddHours(12)
            });

        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/Stats/GetNewUsersToday");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<GetNewUsersTodayResDTO>();
        Assert.NotNull(dto);
        Assert.Equal(2, dto!.UsersRegisteredToday);
    }


    private async Task ResetDbAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.PinReports.RemoveRange(db.PinReports);
        db.CommentReports.RemoveRange(db.CommentReports);
        db.RequestLogs.RemoveRange(db.RequestLogs);
        db.Votes.RemoveRange(db.Votes);
        db.Pins.RemoveRange(db.Pins);
        db.Users.RemoveRange(db.Users);

        await db.SaveChangesAsync();
    }
}