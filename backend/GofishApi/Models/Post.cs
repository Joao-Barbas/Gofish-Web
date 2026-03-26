using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class Post
{
    #region Scalar Properties

    [Key]
    [ForeignKey(nameof(Pin))]
    public int Id { get; set; }

    [MaxLength(2000)]
    public string? Body { get; set; }

    [Url]
    [MaxLength(2000)]
    public string? ImageUrl { get; set; }

    public required DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    #endregion
    #region Navigation Properties

    public AppUser AppUser { get; set; } = null!;
    public Pin Pin { get; set; } = null!;

    public List<PostVote> PostVotes { get; set; } = [];
    public List<PostComment> Comments { get; set; } = []; // TODO
    public List<Group> Groups { get; set; } = [];
    public List<GroupPost> GroupPosts { get; set; } = [];

    #endregion
    #region Computed Properties

    public int CommentCount => Comments.Count;

    #endregion
}
