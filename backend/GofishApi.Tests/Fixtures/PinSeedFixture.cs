using GofishApi.Data;
using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Tests.Fixtutes;

public static class PinSeedFixture
{
    public static async Task<InfoPin> CreateInfoPinAsync(
        AppDbContext db,
        string userId = "test-user-id",
        double latitude = 38.7169,
        double longitude = -9.1399,
        string body = "Test info pin",
        VisibilityLevel visibility = VisibilityLevel.Public,
        AccessDifficulty accessDifficulty = AccessDifficulty.Low,
        Seabed seabed = Seabed.Sand,
        DateTime? createdAt = null,
        DateTime? expiresAt = null,
        string? imageUrl = null)
    {
        var pin = new InfoPin
        {
            Latitude = latitude,
            Longitude = longitude,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            ExpiresAt = expiresAt,
            Visibility = visibility,
            Kind = PinKind.Information,
            UserId = userId,
            Body = body,
            ImageUrl = imageUrl,
            AccessDifficulty = accessDifficulty,
            Seabed = seabed
        };

        db.Pins.Add(pin);
        await db.SaveChangesAsync();
        return pin;
    }

    public static async Task<WarnPin> CreateWarnPinAsync(
        AppDbContext db,
        string userId = "test-user-id",
        double latitude = 38.7169,
        double longitude = -9.1399,
        string body = "Test warn pin",
        VisibilityLevel visibility = VisibilityLevel.Public,
        WarningKind warningKind = WarningKind.StrongCurrents,
        DateTime? createdAt = null,
        DateTime? expiresAt = null,
        string? imageUrl = null)
    {
        var pin = new WarnPin
        {
            Latitude = latitude,
            Longitude = longitude,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddDays(WarnPin.ExpiresInDays),
            Visibility = visibility,
            Kind = PinKind.Warning,
            UserId = userId,
            Body = body,
            ImageUrl = imageUrl,
            WarningKind = warningKind
        };

        db.Pins.Add(pin);
        await db.SaveChangesAsync();
        return pin;
    }

    public static async Task<CatchPin> CreateCatchPinAsync(
        AppDbContext db,
        string userId = "test-user-id",
        double latitude = 38.7169,
        double longitude = -9.1399,
        string body = "Test catch pin",
        VisibilityLevel visibility = VisibilityLevel.Public,
        Species species = Species.Achiga,
        Bait bait = Bait.Worm,
        string? hookSize = null,
        DateTime? createdAt = null,
        DateTime? expiresAt = null,
        string? imageUrl = "https://example.com/test-image.png")
    {
        var pin = new CatchPin
        {
            Latitude = latitude,
            Longitude = longitude,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
            Visibility = visibility,
            Kind = PinKind.Catch,
            UserId = userId,
            Body = body,
            ImageUrl = imageUrl,
            Species = species,
            Bait = bait,
            HookSize = hookSize
        };

        db.Pins.Add(pin);
        await db.SaveChangesAsync();
        return pin;
    }
}