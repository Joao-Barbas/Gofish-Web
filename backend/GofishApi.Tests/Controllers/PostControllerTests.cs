using GofishApi.Tests.Fixtures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using GofishApi.Dtos;
using GofishApi.Data;
using GofishApi.Tests.Fixtutes;
using Microsoft.Extensions.DependencyInjection;
using GofishApi.Models;

namespace GofishApi.Tests.Controllers;

public class PostControllerTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;


    public PostControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    #region GetPosts

    [Fact]
    public async Task GetPosts_Empty_ReturnsOk()
    {
        var body = new
        {
            Ids = new List<object>(),
            DataRequest = new { },
            LastTimestamp = DateTime.UtcNow,
            MaxResults = 10
        };

        var res = await _client.PostAsJsonAsync("/api/Post/GetPosts", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region GetFeed

    [Fact]
    public async Task GetFeed_ReturnsOk()
    {
        var body = new
        {
            Kind = 0, 
            DataRequest = new { },
            LastTimestamp = DateTime.UtcNow,
            MaxResults = 10
        };

        var res = await _client.PostAsJsonAsync("/api/Post/GetFeed", body);

        var content = await res.Content.ReadAsStringAsync(); 
        Console.WriteLine(content);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region DeletePosts

    [Fact]
    public async Task DeletePost_NotFound_Returns404()
    {
        var res = await _client.DeleteAsync("/api/Post/DeletePost/9999");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeletePost_AsOwner_ReturnsNoContent()
    {
        int postId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var pin = await PinSeedFixture.CreateInfoPinAsync(db);
            postId = pin.Post.Id;
        }

        var res = await _client.DeleteAsync($"/api/Post/DeletePost/{postId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    #endregion

    #region PostVotes

    [Fact]
    public async Task PostVote_ValidVote_ReturnsScore()
    {
        int postId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db);
            postId = pin.Post.Id;
        }

        var body = new { Value = 1 };

        var res = await _client.PostAsJsonAsync($"/api/Post/PostVote/{postId}", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<VotePostResDTO>();
        dto!.Score.Should().Be(1);
    }

    [Fact]
    public async Task PostVote_PostNotFound_Returns404()
    {
        var body = new { Value = 1 };

        var res = await _client.PostAsJsonAsync("/api/Post/PostVote/9999", body);

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region Comments

    [Fact]
    public async Task CreateComment_ReturnsId()
    {
        int postId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db);
            postId = pin.Post.Id;
        }

        var body = new
        {
            PostId = postId,
            Body = "Test comment"
        };

        var res = await _client.PostAsJsonAsync("/api/Post/CreateComment", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<CreatePostCommentResDTO>();
        dto!.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateComment_PostNotFound_Returns404()
    {
        var body = new
        {
            PostId = 9999,
            Body = "Test"
        };

        var res = await _client.PostAsJsonAsync("/api/Post/CreateComment", body);

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteComment_AsOwner_ReturnsNoContent()
    {
        int commentId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db);

            var comment = new PostComment
            {
                PostId = pin.Post.Id,
                Body = "Test",
                CreatedAt = DateTime.UtcNow,
                UserId = "test-user-id"
            };

            db.PostComments.Add(comment);
            await db.SaveChangesAsync();

            commentId = comment.Id;
        }

        var res = await _client.DeleteAsync($"/api/Post/DeleteComment/{commentId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    #endregion
}
