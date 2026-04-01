namespace GofishApi.Services;

public interface IGamificationService
{
    int GetRank(int points);
    Task UpdateStreakAsync(string userId);
}
