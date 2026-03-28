using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class Group
{
    [Key]
    public required int Id { get; set; }

    [MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(100)]
    public required string NormalizedName { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Url]
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    [Required]
    public required DateTime CreatedAt { get; set; }

    // Navigation 

    public List<Pin> Pins { get; set; } = [];
    public List<GroupPin> GroupPins { get; set; } = [];
    public List<AppUser> AppUsers { get; set; } = [];
    public List<GroupUser> GroupUsers { get; set; } = [];
}
