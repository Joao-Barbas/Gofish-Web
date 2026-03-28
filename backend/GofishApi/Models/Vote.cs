using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GofishApi.Enums;

namespace GofishApi.Models;

public class Vote
{
    [Key]
    public required int Id { get; set; }

    [ForeignKey(nameof(Pin))]
    public required int PinId { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    public required VoteKind Value { get; set; }

    public required DateTime CreatedAt { get; set; }

    // Navigation

    public Pin Pin { get; set; } = null!;
    public AppUser AppUser { get; set; } = null!;
}