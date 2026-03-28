using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class Comment
{
    [Key]
    public required int Id { get; set; }

    [ForeignKey(nameof(Pin))]
    public required int PinId { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [MaxLength(1000)]
    public required string Body { get; set; }

    public required DateTime CreatedAt { get; set; }

    // Navigation

    public Pin Pin { get; set; } = null!;
    public AppUser AppUser { get; set; } = null!;
}
