namespace GofishApi.Services;

public interface IGamificationService
{
    Task UpdateStreakAsync(string userId);
}
