using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace GofishApi.Tests.Controllers;

public class UserControllerTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;

    public UserControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    [Fact]
    public async Task GetUser_ShouldReturn_Ok_When_User_Exists()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = new AppUser
        {
            Id = "user-2",
            Email = "user2@test.com",
            UserName = "user2",
            NormalizedUserName = "USER2",
            FirstName = "User",
            LastName = "Two",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/User/GetUser/user-2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUser_ShouldReturn_NotFound_When_User_Does_Not_Exist()
    {
        await ResetDbAsync();

        var response = await _client.GetAsync("/api/User/GetUser/not-found-user");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetUserSettings_ShouldReturn_Ok()
    {
        var response = await _client.GetAsync("/api/User/GetUserSettings");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task SearchUsers_ShouldReturn_Empty_When_Query_Has_Less_Than_2_Chars()
    {
        await ResetDbAsync();

        var response = await _client.GetAsync("/api/User/SearchUsers?query=a&maxResults=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<SearchUsersResDto>();
        Assert.NotNull(dto);
        Assert.Empty(dto!.Users);
        Assert.False(dto.HasMoreResults);
        Assert.Null(dto.LastUsername);
    }

    [Fact]
    public async Task SearchUsers_ShouldReturn_Matching_Users()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user1 = new AppUser
        {
            Id = "user-1",
            Email = "joao@test.com",
            UserName = "joao123",
            NormalizedUserName = "JOAO123",
            FirstName = "Joao",
            LastName = "Silva",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var user2 = new AppUser
        {
            Id = "user-2",
            Email = "joana@test.com",
            UserName = "joana456",
            NormalizedUserName = "JOANA456",
            FirstName = "Joana",
            LastName = "Costa",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var user3 = new AppUser
        {
            Id = "user-3",
            Email = "miguel@test.com",
            UserName = "miguel999",
            NormalizedUserName = "MIGUEL999",
            FirstName = "Miguel",
            LastName = "Rocha",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.AddRange(user1, user2, user3);

        db.UserProfiles.AddRange(
            new UserProfile { UserId = "user-1", JoinedAt = DateTime.UtcNow, LastActiveAt = DateTime.UtcNow, LastUpdateAt = DateTime.UtcNow },
            new UserProfile { UserId = "user-2", JoinedAt = DateTime.UtcNow, LastActiveAt = DateTime.UtcNow, LastUpdateAt = DateTime.UtcNow },
            new UserProfile { UserId = "user-3", JoinedAt = DateTime.UtcNow, LastActiveAt = DateTime.UtcNow, LastUpdateAt = DateTime.UtcNow }
        );

        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/User/SearchUsers?query=jo&maxResults=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dto = await response.Content.ReadFromJsonAsync<SearchUsersResDto>();
        Assert.NotNull(dto);
        Assert.Equal(2, dto!.Users.Count());
        Assert.False(dto.HasMoreResults);
    }

    #region Frienships

    [Fact]
    public async Task RequestFriendship_ShouldReturn_BadRequest_When_Requesting_Self()
    {
        await ResetDbAsync();

        var dto = new RequestFriendshipReqDto("test-user-id");

        var response = await _client.PostAsJsonAsync("/api/User/RequestFriendship", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RequestFriendship_ShouldReturn_NotFound_When_Receiver_Does_Not_Exist()
    {
        await ResetDbAsync();

        var dto = new RequestFriendshipReqDto("missing-user");

        var response = await _client.PostAsJsonAsync("/api/User/RequestFriendship", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RequestFriendship_ShouldReturn_Created_When_Request_Is_Valid()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Users.Add(new AppUser
        {
            Id = "user-2",
            Email = "user2@test.com",
            UserName = "user2",
            NormalizedUserName = "USER2",
            FirstName = "User",
            LastName = "Two",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        });
        db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-2",
            JoinedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow,
            LastUpdateAt = DateTime.UtcNow,
            CatchPoints = 0,
            AvatarUrl = null
        });

        await db.SaveChangesAsync();

        var dto = new RequestFriendshipReqDto("user-2");

        var response = await _client.PostAsJsonAsync("/api/User/RequestFriendship", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var friendship = db.Friendships.SingleOrDefault();
        Assert.NotNull(friendship);
        Assert.Equal("test-user-id", friendship!.RequesterUserId);
        Assert.Equal("user-2", friendship.ReceiverUserId);
        Assert.Equal(FriendshipState.Pending, friendship.State);
    }

    [Fact]
    public async Task RequestFriendship_ShouldReturn_Conflict_When_Friendship_Already_Exists()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Users.Add(new AppUser
        {
            Id = "user-2",
            Email = "user2@test.com",
            UserName = "user2",
            NormalizedUserName = "USER2",
            FirstName = "User",
            LastName = "Two",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        });

        db.Friendships.Add(new Friendship
        {
            RequesterUserId = "test-user-id",
            ReceiverUserId = "user-2",
            State = FriendshipState.Pending,
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync();

        var dto = new RequestFriendshipReqDto("user-2");

        var response = await _client.PostAsJsonAsync("/api/User/RequestFriendship", dto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task AcceptFriendship_ShouldReturn_Ok_When_Request_Is_Valid()
    {
        await ResetDbAsync();

        int friendshipId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            db.Users.Add(new AppUser
            {
                Id = "user-2",
                Email = "user2@test.com",
                UserName = "user2",
                NormalizedUserName = "USER2",
                FirstName = "User",
                LastName = "Two",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            });

            var friendship = new Friendship
            {
                RequesterUserId = "user-2",
                ReceiverUserId = "test-user-id",
                State = FriendshipState.Pending,
                CreatedAt = DateTime.UtcNow
            };

            db.Friendships.Add(friendship);
            await db.SaveChangesAsync();

            friendshipId = friendship.Id;
        }

        var response = await _client.PatchAsync($"/api/User/AcceptFriendship/{friendshipId}", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using (var verifyScope = _factory.Services.CreateScope())
        {
            var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
            var updated = await verifyDb.Friendships.FindAsync(friendshipId);

            Assert.NotNull(updated);
            Assert.Equal(FriendshipState.Accepted, updated!.State);
            Assert.NotNull(updated.RepliedAt);
        }
    }

    [Fact]
    public async Task AcceptFriendship_ShouldReturn_NotFound_When_Request_Does_Not_Exist()
    {
        await ResetDbAsync();

        var response = await _client.PatchAsync("/api/User/AcceptFriendship/9999", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteFriendship_ShouldReturn_NoContent_When_User_Is_Participant()
    {
        await ResetDbAsync();

        int friendshipId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            db.Users.Add(new AppUser
            {
                Id = "user-2",
                Email = "user2@test.com",
                UserName = "user2",
                NormalizedUserName = "USER2",
                FirstName = "User",
                LastName = "Two",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            });

            var friendship = new Friendship
            {
                RequesterUserId = "test-user-id",
                ReceiverUserId = "user-2",
                State = FriendshipState.Accepted,
                CreatedAt = DateTime.UtcNow
            };

            db.Friendships.Add(friendship);
            await db.SaveChangesAsync();

            friendshipId = friendship.Id;
        }

        var response = await _client.DeleteAsync($"/api/User/DeleteFriendship/{friendshipId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using (var verifyScope = _factory.Services.CreateScope())
        {
            var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
            var deleted = await verifyDb.Friendships.FindAsync(friendshipId);

            Assert.Null(deleted);
        }
    }

    [Fact]
    public async Task GetFriendshipBetween_ShouldReturn_Ok_When_Friendship_Exists()
    {
        await ResetDbAsync();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Users.Add(new AppUser
        {
            Id = "user-2",
            Email = "user2@test.com",
            UserName = "user2",
            NormalizedUserName = "USER2",
            FirstName = "User",
            LastName = "Two",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        });

        db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-2",
            JoinedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow,
            LastUpdateAt = DateTime.UtcNow
        });

        var friendship = new Friendship
        {
            RequesterUserId = "test-user-id",
            ReceiverUserId = "user-2",
            State = FriendshipState.Accepted,
            CreatedAt = DateTime.UtcNow
        };

        db.Friendships.Add(friendship);
        await db.SaveChangesAsync();

        var response = await _client.GetAsync("/api/User/GetFriendshipBetween?userId1=test-user-id&userId2=user-2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }


    #endregion

    private async Task ResetDbAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Friendships.RemoveRange(db.Friendships);
        db.GroupUsers.RemoveRange(db.GroupUsers);
        db.Groups.RemoveRange(db.Groups);
        db.UserProfiles.RemoveRange(db.UserProfiles.Where(x => x.UserId != "test-user-id"));
        db.Users.RemoveRange(db.Users.Where(x => x.Id != "test-user-id"));

        await db.SaveChangesAsync();
    }
}