using GofishApi.Data;
using GofishApi.Enums;
using GofishApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GofishApi.Tests.Fixtutes;

public static class PinSeedFixture
{
    public static async Task<InfoPin> CreateInfoPinAsync(
        AppDbContext db,
        string userId = "test-user-id",
        double latitude = 38.7169,
        double longitude = -9.1399,
        string body = "Test info pin",
        VisibilityLevel visibility = 0,
        AccessDifficulty accessDifficulty = AccessDifficulty.Low,
        Seabed seabed = Seabed.Sand)
    {
        var pin = new InfoPin
        {
            Latitude = latitude,
            Longitude = longitude,
            CreatedAt = DateTime.UtcNow,
            Visibility = visibility,
            Kind = PinKind.Information,
            UserId = userId,
            AccessDifficulty = accessDifficulty,
            Seabed = seabed,
            Post = new Post
            {
                Body = body,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            }
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
        VisibilityLevel visibility = 0,
        WarningKind warningKind = WarningKind.StrongCurrents)
    {
        var pin = new WarnPin
        {
            Latitude = latitude,
            Longitude = longitude,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(WarnPin.ExpiresInDays),
            Visibility = visibility,
            Kind = PinKind.Warning,
            UserId = userId,
            WarningKind = warningKind,
            Post = new Post
            {
                Body = body,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            }
        };

        db.Pins.Add(pin);
        await db.SaveChangesAsync();
        return pin;
    }
}
