using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class UserProfile
{
    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    [Url]
    [MaxLength(2000)]
    public string? AvatarUrl { get; set; }

    public int CatchPoints { get; set; } = 0;

    public int CatchPointsLastMonth { get; set; } = 0;

    public DateTime JoinedAt { get; set; } = DateTime.Now;
    
    public DateTime LastActiveAt { get; set; } = DateTime.Now;

    public int WeeklyStreak { get; set; } = 0;
    
    public int MaxWeeklyStreak { get; set; } = 0;
    
    public DateTime? LastUpdateAt { get; set; }

    public DateTime? LastPinWeekStart { get; set; }

    // Navigation

    public AppUser AppUser { get; set; } = null!;

    // Computed

    public int MonthlyPointsDelta => CatchPoints - CatchPointsLastMonth;
}
