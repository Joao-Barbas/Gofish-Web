using GofishApi.Data;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Options;
using Microsoft.Extensions.Options;

namespace GofishApi.Services;

public class GamificationService : IGamificationService
{
    private readonly GamificationOptions _opts;
    private readonly AppDbContext _db;

    // Rank definitions are static because GetRank is called from DTO factory methods
    // that have no access to DI. To add ranks, extend this list in ascending threshold order.
    // Rank 1 is implicit for any score below the first threshold.
    private static readonly IReadOnlyList<RankDefinition> Ranks =
    [
        new() { Threshold = 0,   Rank = 2 },
        new() { Threshold = 15,  Rank = 3 },
        new() { Threshold = 30,  Rank = 4 },
        new() { Threshold = 120, Rank = 5 }
    ];

    public GamificationService(
        IOptions<GamificationOptions> options,
        AppDbContext db
    )
    {
        _opts = options.Value;
        _db = db;
    }

    #region Points

    public async Task<int?> TryGetPoints(string userId)
    {
        var profile = await _db.UserProfiles.FindAsync(userId);
        return profile?.CatchPoints;
    }

    public async Task<GamificationResult> ApplyUserPoints(string userId, int points)
    {
        var profile = await _db.UserProfiles.FindAsync(userId);
        if (profile is null)
        {
            return GamificationResult.Failed("Unable to find user.");
        }
        profile.CatchPoints += points;
        await _db.SaveChangesAsync();
        return GamificationResult.Success;
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

    // Called from DTO factory methods — must remain public static.
    public static int GetRank(int points)
    {
        for (int i = Ranks.Count - 1; i >= 0; i--)
        {
            if (points >= Ranks[i].Threshold)
                return Ranks[i].Rank;
        }
        return 1;
    }

    #endregion
    #region Voting

    public async Task<int> ApplyVoteAsync(string voterId, Pin pin, VoteKind newVote, Vote? existingVote)
    {
        bool wasDownvote = existingVote?.Value == VoteKind.Downvote;
        bool isDownvote  = newVote == VoteKind.Downvote;

        int ownerPointsDelta;
        int pinScoreDelta;

        if (existingVote is null)
        {
            // New vote
            ownerPointsDelta = isDownvote ? -_opts.DownvotePointLoss : _opts.UpvotePointGain;
            pinScoreDelta    = isDownvote ? -1 : 1;
            _db.Votes.Add(new Vote 
            {
                PinId = pin.Id,
                UserId = voterId,
                Value = newVote,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            // Switching vote: reverse previous effect, apply new
            int prevEffect = wasDownvote ? -_opts.DownvotePointLoss : _opts.UpvotePointGain;
            int newEffect  = isDownvote  ? -_opts.DownvotePointLoss : _opts.UpvotePointGain;

            ownerPointsDelta = newEffect - prevEffect;
            pinScoreDelta    = (isDownvote ? -1 : 1) - (wasDownvote ? -1 : 1);

            existingVote.Value = newVote;
        }

        var ownerProfile = await _db.UserProfiles.FindAsync(pin.UserId);
        if (ownerProfile is not null) ownerProfile.CatchPoints += ownerPointsDelta;
        pin.Score += pinScoreDelta;

        using var transaction = await _db.Database.BeginTransactionAsync();
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return pin.Score;
    }

    public async Task<int> RemoveVoteAsync(string voterId, Pin pin, Vote existingVote)
    {
        bool wasDownvote = existingVote.Value == VoteKind.Downvote;

        // Reverse the vote's effects
        int ownerPointsDelta = wasDownvote ? _opts.DownvotePointLoss : -_opts.UpvotePointGain;
        int pinScoreDelta    = wasDownvote ? 1 : -1;

        _db.Votes.Remove(existingVote);

        var ownerProfile = await _db.UserProfiles.FindAsync(pin.UserId);
        if (ownerProfile is not null) ownerProfile.CatchPoints += ownerPointsDelta;
        pin.Score += pinScoreDelta;

        using var transaction = await _db.Database.BeginTransactionAsync();
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return pin.Score;
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
}
