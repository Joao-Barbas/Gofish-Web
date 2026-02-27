using GofishApi.Tests.Fixtutes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GofishApi.Tests.Controllers;

public class PinControllerTests
{
    private readonly HttpClient _client;

    public PinControllerTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    #region GetInViewport

    [Fact]
    public async Task GetInViewPort_WithoutToken_Returns401() { }

    [Fact]
    public async Task GetInViewPort_WithToken_Returns200() { }

    #endregion // GetInViewport
    #region GetPins

    [Fact]
    public async Task GetPins_WithToken_Returns200() { }

    [Fact]
    public async Task GetPins_WithoutToken_Returns401() { }


    #endregion // GetPins


}
