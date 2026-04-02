using GofishApi.Controllers;
using GofishApi.Data;
using GofishApi.Models;
using GofishApi.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.Extensions.Options;

namespace GofishApi.Services;

public class GamificationService : IGamificationService
{
    private readonly ILogger<GamificationService> _logger;
    private readonly IOptions<GamificationOptions> _options;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    private static readonly RankDefinition LowestRank = new() { Threshold = int.MinValue, Rank = 1 };
    private static readonly IReadOnlyList<RankDefinition> Ranks =
    [
        new() { Threshold = 0,   Rank = 2 },
        new() { Threshold = 15,  Rank = 3 },
        new() { Threshold = 30,  Rank = 4 },
        new() { Threshold = 120, Rank = 5 }
    ];

    public GamificationService(
        ILogger<GamificationService> logger,
        IOptions<GamificationOptions> options,
        AppDbContext db,
        UserManager<AppUser> userManager
    )
    {
        _logger = logger;
        _options = options;
        _db = db;
        _userManager = userManager;
    }

    #region Points

    public async Task<int?> TryGetPoints(string userId)
    {
        var profile = await _db.UserProfiles.FindAsync(userId);
        return profile?.CatchPoints;
    }

    public async Task<GamificationResult> TryDecrementPoints(string userId, int points)
    {
        var profile = await _db.UserProfiles.FindAsync(userId);
        if (profile is null)
        {
            return GamificationResult.Failed("Unable to find user.");
        }
        if (profile.CatchPoints < points)
        {
            return GamificationResult.Failed("You don't have enough catch points.");
        }
        profile.CatchPoints -= points;
        await _db.SaveChangesAsync();
        return GamificationResult.Success;
    }

    public static int GetRank(int points)
    {
        for (int i = Ranks.Count - 1; i >= 0; i--)
        {
            if (points >= Ranks[i].Threshold)
            {
                return Ranks[i].Rank;
            }
        }
        return LowestRank.Rank;
    }

    #endregion
    #region Streak

    public async Task UpdateStreakAsync(string userId)
    {
        var profile = await _db.UserProfiles.FindAsync(userId);
        if (profile is null) return;

        var currentWeekStart = GetWeekStart(DateTime.UtcNow);
        var lastWeekStart = GetWeekStart(DateTime.UtcNow.AddDays(-7));

        if (profile.LastPinWeekStart == currentWeekStart)
        {
            return;
        }
        else if (profile.LastPinWeekStart == lastWeekStart)
        {
            profile.WeeklyStreak++;
        }
        else
        {
            profile.WeeklyStreak = 1;
        }
        if (profile.WeeklyStreak > profile.MaxWeeklyStreak)
        {
            profile.MaxWeeklyStreak = profile.WeeklyStreak;
        }

        profile.LastPinWeekStart = currentWeekStart;
        await _db.SaveChangesAsync();
    }

    // Helpers

    private static DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }

    #endregion
}

public sealed class GamificationResult
{
    private static readonly GamificationResult _success = new() { Succeeded = true };
    private string _error = "Gamification error has occured";

    public bool Succeeded { get; private set; }

    public static GamificationResult Success => _success;
    public string Error => _error;

    public static GamificationResult Failed(string? error)
    {
        var result = new GamificationResult { Succeeded = false };
        if (error is not null)
        {
            result._error = error;
        }
        return result;
    }
}

public sealed class RankDefinition
{
    public int Threshold { get; init; }
    public int Rank { get; init; }
    // public string Name { get; init; } = string.Empty;
}
