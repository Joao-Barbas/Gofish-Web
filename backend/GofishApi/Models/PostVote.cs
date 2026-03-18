using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class PostVote
{
    #region Scalar Properties

    [ForeignKey(nameof(Post))]
    public int PostId { get; set; }

    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; } = null!;

    [Required]
    public DateTime CreatedAt { get; set; }

    public VoteType Value { get; set; }

    #endregion

    #region Navigation Properties

    public Post Post { get; set; } = null!;

    public AppUser AppUser { get; set; } = null!;

    #endregion
}