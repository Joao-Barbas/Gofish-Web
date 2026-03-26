using GofishApi.Data;

namespace GofishApi.Services;

public class GamificationService : IGamificationService
{
    private readonly AppDbContext _db;

    public GamificationService(
        AppDbContext db
    )
    {
        _db = db;
    }

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
}
