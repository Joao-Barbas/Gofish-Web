using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class UserProfile
{
    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; } = default!;

    [MaxLength(500)]
    public string? Bio { get; set; }

    [Url]
    [MaxLength(2000)]
    public string? AvatarUrl { get; set; }

    public int FishingScore { get; set; }
    public DateTime LastUpdateAt { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime LastActiveAt { get; set; }

    // Navigation

    public AppUser AppUser { get; set; } = default!;
}
