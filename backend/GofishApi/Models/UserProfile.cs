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

    public required int FishingScore { get; set; } = 0;

    public required DateTime JoinedAt { get; set; } = DateTime.Now;
    
    public required DateTime LastActiveAt { get; set; } = DateTime.Now;

    public required int WeeklyStreak { get; set; } = 0;
    
    public required int MaxWeeklyStreak { get; set; } = 0;
    
    public DateTime? LastUpdateAt { get; set; }

    public DateTime? LastPinWeekStart { get; set; }

    // Navigation

    public AppUser AppUser { get; set; } = null!;
}
