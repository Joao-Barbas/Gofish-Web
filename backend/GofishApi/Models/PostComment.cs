using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class PostComment
{
    [Key]
    public int Id { get; set; }

    [MaxLength(1000)]
    public required string Body { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(Post))]
    public int PostId { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    // Navigation

    public Post Post { get; set; }
    public AppUser AppUser { get; set; }
}
