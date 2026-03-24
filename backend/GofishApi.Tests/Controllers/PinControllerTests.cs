using FluentAssertions;
using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Tests.Fixtures;
using GofishApi.Tests.Fixtutes;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace GofishApi.Tests.Controllers;

public class PinControllerTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;


    public PinControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    #region GetInViewport

    [Fact]
    public async Task GetInViewport_ReturnsOk()
    {
        var url = "/api/Pin/GetInViewport?minLat=-90&minLng=-180&maxLat=90&maxLng=180";
        var res = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task GetInViewport_WhenNoPins_ReturnsEmptyList()
    {
        var url = "/api/Pin/GetInViewport?minLat=-90&minLng=-180&maxLat=90&maxLng=180";

        var res = await _client.GetAsync(url);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await res.Content.ReadFromJsonAsync<ViewportPinsResDTO>();
        dto.Should().NotBeNull();
        dto!.Pins.Should().NotBeNull();
    }

    [Fact]
    public async Task GetInViewport_ReturnsOnlyPinsInsideViewport()
    {
        int insidePinId;
        int outsidePinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var insidePin = await PinSeedFixture.CreateInfoPinAsync(
                db,
                latitude: 38.7169,
                longitude: -9.1399,
                body: "Inside"
            );

            var outsidePin = await PinSeedFixture.CreateInfoPinAsync(
                db,
                latitude: 50.0,
                longitude: 10.0,
                body: "Outside"
            );

            insidePinId = insidePin.Id;
            outsidePinId = outsidePin.Id;
        }

        var res = await _client.GetAsync("/api/Pin/GetInViewport?minLat=38&minLng=-10&maxLat=39&maxLng=-9");

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<ViewportPinsResDTO>();
        dto.Should().NotBeNull();
        dto!.Pins.Should().Contain(p => p.Id == insidePinId);
        dto.Pins.Should().NotContain(p => p.Id == outsidePinId);
    }

    [Fact]
    public async Task GetInViewport_DoesNotReturnExpiredPins()
    {
        int expiredPinId;
        int validPinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var expiredPin = await PinSeedFixture.CreateInfoPinAsync(
                db,
                latitude: 38.7169,
                longitude: -9.1399,
                body: "Expired"
            );

            expiredPin.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);

            var validPin = await PinSeedFixture.CreateInfoPinAsync(
                db,
                latitude: 38.7170,
                longitude: -9.1400,
                body: "Valid"
            );

            await db.SaveChangesAsync();

            expiredPinId = expiredPin.Id;
            validPinId = validPin.Id;
        }

        var res = await _client.GetAsync("/api/Pin/GetInViewport?minLat=38&minLng=-10&maxLat=39&maxLng=-9");

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<ViewportPinsResDTO>();
        dto.Should().NotBeNull();
        dto!.Pins.Should().Contain(p => p.Id == validPinId);
        dto.Pins.Should().NotContain(p => p.Id == expiredPinId);
    }

    [Fact]
    public async Task GetInViewport_WhenAllPinsAreOutside_ReturnsEmptyList()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await PinSeedFixture.CreateInfoPinAsync(
                db,
                latitude: 50.0,
                longitude: 10.0,
                body: "Outside 1"
            );

            await PinSeedFixture.CreateInfoPinAsync(
                db,
                latitude: 51.0,
                longitude: 11.0,
                body: "Outside 2"
            );
        }

        var res = await _client.GetAsync("/api/Pin/GetInViewport?minLat=38&minLng=-10&maxLat=39&maxLng=-9");

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<ViewportPinsResDTO>();
        dto.Should().NotBeNull();
        dto!.Pins.Should().BeEmpty();
    }

    #endregion GetInViewport

    #region PinCreation

    [Fact]
    public async Task CreateInfoPin_ReturnsPinId()
    {
        var body = new
        {
            Latitude = 38.7169,
            Longitude = -9.1399,
            Visibility = 0,
            Body = "Test pin",
            AccessDifficulty = 1,
            Seabed = 1
        };

        var res = await _client.PostAsJsonAsync("/api/Pin/CreateInfoPin", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<CreateInfoPinResDTO>();

        dto.Should().NotBeNull();
        dto!.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateWarnPin_ReturnsId()
    {
        var body = new
        {
            Latitude = 38.7,
            Longitude = -9.1,
            Visibility = 0,
            Body = "Warning test",
            WarningKind = 0
        };

        var res = await _client.PostAsJsonAsync("/api/Pin/CreateWarnPin", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<CreateWarnPinResDTO>();
        dto!.Id.Should().BeGreaterThan(0);
    }

    #endregion

    #region GetPins

    [Fact]
    public async Task GetPins_ByPinId_ReturnsCorrectPin()
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
            Ids = new[]
            {
            new { PinId = pinId }
        },
            DataRequest = 0
        };

        var res = await _client.PostAsJsonAsync("/api/Pin/GetPins", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<GetPinsResDTO>();
        dto!.Pins.Should().Contain(p => p.Id == pinId);
    }

    [Fact]
    public async Task GetPins_ByAuthorId_ReturnsPins()
    {
        string userId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db, userId: "user-123");
            userId = pin.UserId!;
        }

        var body = new
        {
            Ids = new[]
            {
            new { AuthorId = userId }
        },
            DataRequest = 0
        };

        var res = await _client.PostAsJsonAsync("/api/Pin/GetPins", body);

        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var dto = await res.Content.ReadFromJsonAsync<GetPinsResDTO>();
        dto!.Pins.Should().NotBeEmpty();
    }

    #endregion

    #region DeletePins

    [Fact]
    public async Task DeletePin_AsOwner_RemovesFromDatabase()
    {
        int pinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pin = await PinSeedFixture.CreateInfoPinAsync(db);
            pinId = pin.Id;
        }

        var res = await _client.DeleteAsync($"/api/Pin/DeletePin/{pinId}");

        res.StatusCode.Should().Be(HttpStatusCode.NoContent);

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var deleted = await db.Pins.FindAsync(pinId);
            deleted.Should().BeNull();
        }
    }

    [Fact]
    public async Task DeletePin_WhenNotOwner_ReturnsForbid()
    {
        int pinId;

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var pin = await PinSeedFixture.CreateInfoPinAsync(db, userId: "owner-id");
            pinId = pin.Id;
        }

        // Fake auth provavelmente usa "test-user-id"
        var res = await _client.DeleteAsync($"/api/Pin/DeletePin/{pinId}");

        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion
}
