using FluentAssertions;
using GofishApi.Dtos;
using GofishApi.Tests.Fixtures;
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

    public PinControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    #region GetInViewport

    [Fact]
    public async Task GetInViewport_ReturnsOk()
    {
        var url = "/api/Pin/GetInViewport?minLat=-90&minLng=-180&maxLat=90&maxLng=180";
        var res = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    #endregion GetInViewport


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
}
