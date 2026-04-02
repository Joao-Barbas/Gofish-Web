using GofishApi.Data;

namespace GofishApi.Services;

public class GamificationService : IGamificationService
{
    private readonly AppDbContext _db;

    private static readonly (int Threshold, int Rank)[] Ranks =
    {
        (int.MinValue, 1),
        (0, 2),
        (15, 3),
        (30, 4),
        (120, 5)
    };

    public GamificationService(AppDbContext db)
    {
        _db = db;
    }

    #region Ranking

    public static int GetRank(int points)
    {
        for (int i = Ranks.Length - 1; i >= 0; i--)
        {
            if (points >= Ranks[i].Threshold)
                return Ranks[i].Rank;
        }
        return Ranks[0].Rank;
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
