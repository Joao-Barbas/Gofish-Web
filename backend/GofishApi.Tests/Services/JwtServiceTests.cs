using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using GofishApi.Models;
using GofishApi.Options;
using GofishApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace GofishApi.Tests.Services;

public class JwtServiceTests
{
    private readonly JwtOptions _jwtOptions = new()
    {
        Secret = "super_secret_key_with_at_least_32_chars!",
        Issuer = "GofishApi",
        Audience = "GofishApiUsers",
        ExpirationMinutes = 60
    };

    private static Mock<UserManager<AppUser>> CreateUserManagerMock()
    {
        var store = new Mock<IUserStore<AppUser>>();
        return new Mock<UserManager<AppUser>>(
            store.Object,
            null!, null!, null!, null!, null!, null!, null!, null!
        );
    }

    private IOptions<JwtOptions> CreateOptions()
    {
        var optionsMock = new Mock<IOptions<JwtOptions>>();
        optionsMock.Setup(x => x.Value).Returns(_jwtOptions);
        return optionsMock.Object;
    }

    [Fact]
    public async Task CreateTokenAsync_WithRoles_ReturnsValidJwt()
    {
        var userManagerMock = CreateUserManagerMock();

        userManagerMock
            .Setup(x => x.GetLoginsAsync(It.IsAny<AppUser>()))
            .ReturnsAsync(new List<UserLoginInfo>());

        var service = new JwtService(
            CreateOptions(),
            userManagerMock.Object
        );

        var user = new AppUser
        {
            Id = "user-1",
            UserName = "player1",
            FirstName = "Daniel",
            LastName = "Silva",
            Email = "player1@gofish.com"
        };

        var token = await service.CreateTokenAsync(user, new List<string> { "Admin", "User" });

        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "user-1");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.UniqueName && c.Value == "player1");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.GivenName && c.Value == "Daniel");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.FamilyName && c.Value == "Silva");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "player1@gofish.com");
        jwt.Claims.Should().Contain(c => c.Type == "login_provider" && c.Value == "Local");
        jwt.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Admin");
        jwt.Claims.Should().Contain(c => c.Type == "role" && c.Value == "User");

        jwt.Issuer.Should().Be(_jwtOptions.Issuer);
        jwt.Audiences.Should().Contain(_jwtOptions.Audience);
    }

    [Fact]
    public async Task CreateTokenAsync_WhenUserHasExternalLogin_SetsLoginProviderClaim()
    {
        var userManagerMock = CreateUserManagerMock();

        userManagerMock
            .Setup(x => x.GetLoginsAsync(It.IsAny<AppUser>()))
            .ReturnsAsync(new List<UserLoginInfo>
            {
                new("Google", "google-id-123", "Google")
            });

        var service = new JwtService(
            CreateOptions(),
            userManagerMock.Object
        );

        var user = new AppUser
        {
            Id = "user-2",
            UserName = "player2"
        };

        var token = await service.CreateTokenAsync(user, new List<string>());

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Claims.Should().Contain(c => c.Type == "login_provider" && c.Value == "Google");
    }

    [Fact]
    public async Task CreateTokenAsync_WithoutExplicitRoles_LoadsRolesFromUserManager()
    {
        var userManagerMock = CreateUserManagerMock();

        userManagerMock
            .Setup(x => x.GetLoginsAsync(It.IsAny<AppUser>()))
            .ReturnsAsync(new List<UserLoginInfo>());

        userManagerMock
            .Setup(x => x.GetRolesAsync(It.IsAny<AppUser>()))
            .ReturnsAsync(new List<string> { "Admin" });

        var service = new JwtService(
            CreateOptions(),
            userManagerMock.Object
        );

        var user = new AppUser
        {
            Id = "user-3",
            UserName = "admin1"
        };

        var token = await service.CreateTokenAsync(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Admin");

        userManagerMock.Verify(x => x.GetRolesAsync(user), Times.Once);
    }

    [Fact]
    public async Task CreateTokenAsync_SetsExpirationCloseToConfiguredMinutes()
    {
        var userManagerMock = CreateUserManagerMock();

        userManagerMock
            .Setup(x => x.GetLoginsAsync(It.IsAny<AppUser>()))
            .ReturnsAsync(new List<UserLoginInfo>());

        var service = new JwtService(
            CreateOptions(),
            userManagerMock.Object
        );

        var user = new AppUser
        {
            Id = "user-4",
            UserName = "player4"
        };

        var before = DateTime.UtcNow;
        var token = await service.CreateTokenAsync(user, new List<string>());
        var after = DateTime.UtcNow;

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.ValidTo.Should().BeOnOrAfter(before.AddMinutes(_jwtOptions.ExpirationMinutes).AddSeconds(-5));
        jwt.ValidTo.Should().BeOnOrBefore(after.AddMinutes(_jwtOptions.ExpirationMinutes).AddSeconds(5));
    }
}