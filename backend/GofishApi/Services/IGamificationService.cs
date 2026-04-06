using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Services;

public interface IGamificationService
{
    Task<int?> TryGetPoints(string userId);
    Task<GamificationResult> ApplyUserPoints(string userId, int points);
    Task<GamificationResult> TryDecrementPoints(string userId, int points);

    /// <summary>
    /// Applies a new vote or switches an existing one, updating the pin score and both users' points.
    /// The caller is responsible for ensuring newVote != existingVote.Value before calling.
    /// </summary>
    Task<int> ApplyVoteAsync(string voterId, Pin pin, VoteKind newVote, Vote? existingVote);

    /// <summary>
    /// Removes an existing vote, reversing its effects on pin score and user points.
    /// </summary>
    Task<int> RemoveVoteAsync(string voterId, Pin pin, Vote existingVote);

    Task UpdateStreakAsync(string userId);
}
