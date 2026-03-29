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
using FluentAssertions;
using GofishApi.Models;

namespace GofishApi.Tests.Controllers;

public class ReportController : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;

    public ReportController(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    #region ReportPins

    [Fact]
    public async Task CreatePinReport_ReturnsId()
    {
        int pinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db);
            pinId = pin.Id;
        }

        var body = new
        {
            PinId = pinId,
            Reason = 0, // enum PinReportReason
            Description = "Spam"
        };

        var res = await _client.PostAsJsonAsync("/api/Report/CreatePinReport", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<CreatePinReportResDTO>();
        dto!.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreatePinReport_PinNotFound_Returns404()
    {
        var body = new
        {
            PinId = 9999,
            Reason = 0,
            Description = "Test"
        };

        var res = await _client.PostAsJsonAsync("/api/Report/CreatePinReport", body);

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreatePinReport_AlreadyReported_ReturnsBadRequest()
    {
        int pinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db);
            pinId = pin.Id;

            db.PinReports.Add(new PinReport
            {
                PinId = pinId,
                UserId = "test-user-id",
                Reason = 0,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
        }

        var body = new
        {
            PinId = pinId,
            Reason = 0,
            Description = "Again"
        };

        var res = await _client.PostAsJsonAsync("/api/Report/CreatePinReport", body);

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region ReportComment

    [Fact]
    public async Task CreateCommentReport_ReturnsId()
    {
        int commentId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var pin = await PinSeedFixture.CreateInfoPinAsync(db);

            var comment = new Comment
            {
                PinId = pin.Id,
                Body = "Test",
                CreatedAt = DateTime.UtcNow,
                UserId = "test-user-id"
            };

            db.Comments.Add(comment);
            await db.SaveChangesAsync();

            commentId = comment.Id;
        }

        var body = new
        {
            CommentId = commentId,
            Reason = 0,
            Description = "Spam"
        };

        var res = await _client.PostAsJsonAsync("/api/Report/CreateCommentReport", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<CreateCommentReportResDTO>();
        dto!.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateCommentReport_NotFound_Returns404()
    {
        var body = new
        {
            CommentId = 9999,
            Reason = 0,
            Description = "Test"
        };

        var res = await _client.PostAsJsonAsync("/api/Report/CreateCommentReport", body);

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCommentReport_AlreadyReported_ReturnsBadRequest()
    {
        int commentId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var pin = await PinSeedFixture.CreateInfoPinAsync(db);

            var comment = new Comment
            {
                PinId = pin.Id,
                Body = "Test",
                CreatedAt = DateTime.UtcNow,
                UserId = "test-user-id"
            };

            db.Comments.Add(comment);
            await db.SaveChangesAsync();

            db.CommentReports.Add(new CommentReport
            {
                CommentId = comment.Id,
                UserId = "test-user-id",
                Reason = 0,
                CreatedAt = DateTime.UtcNow,
                Description = null
            });

            await db.SaveChangesAsync();

            commentId = comment.Id;
        }

        var body = new
        {
            CommentId = commentId,
            Reason = 0,
            Description = "Again"
        };

        var res = await _client.PostAsJsonAsync("/api/Report/CreateCommentReport", body);

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
