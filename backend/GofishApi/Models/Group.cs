using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class Group
{
    [Key]
    public int Id { get; set; }

    [MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(100)]
    public required string NormalizedName { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; }

    [Url]
    [MaxLength(500)]
    public string AvatarUrl { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    // Navigation 

    public List<Post> Posts { get; set; } = [];
    public List<GroupPost> GroupPosts { get; set; } = [];

    public List<AppUser> AppUsers { get; set; } = [];
    public List<GroupUser> GroupUsers { get; set; } = [];
}
