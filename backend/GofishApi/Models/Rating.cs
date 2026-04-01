using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class Rating
{
    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; }

    public required DateTime CreatedAt { get; set; }

    [Range(1, 5)]
    public int Stars    { get; set; }

    [MaxLength(200)]
    public string Title { get; set; }

    [MaxLength(2000)]
    public string Body  { get; set; }

    // Navigation

    public AppUser AppUser { get; set; } = null!;
}
