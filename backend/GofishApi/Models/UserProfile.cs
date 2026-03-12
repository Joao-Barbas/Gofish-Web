using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class UserProfile
{
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    public int FishingScore { get; set; }

    public DateTime LastUpdateAt { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    [Url]
    [MaxLength(2000)]
    public string? AvatarUrl { get; set; }

    public DateTime JoinedAt { get; set; }

    public DateTime LastActiveAt { get; set; }

    // Navigation

    public AppUser User { get; set; }

}
