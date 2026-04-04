using GofishApi.Data;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Services;

public class MonthlySnapshotService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MonthlySnapshotService> _logger;

    public MonthlySnapshotService(
        IServiceScopeFactory scopeFactory,
        ILogger<MonthlySnapshotService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
            var delay = nextMonth - now;
            _logger.LogInformation("Next snapshot in {Delay}", delay);
            await Task.Delay(delay, stoppingToken);
            await TakeSnapshotAsync();
        }
    }

    private async Task TakeSnapshotAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        _logger.LogInformation("Taking monthly catch points snapshot");
        await db.UserProfiles.ExecuteUpdateAsync(up => up.SetProperty(p => p.CatchPointsLastMonth, p => p.CatchPoints));
        _logger.LogInformation("Monthly snapshot complete");
    }
}
