namespace GofishApi.Services;

public interface IGamificationService
{
    Task<int?> TryGetPoints(string userId);
    Task<GamificationResult> TryDecrementPoints(string userId, int points);
    Task UpdateStreakAsync(string userId);
}
