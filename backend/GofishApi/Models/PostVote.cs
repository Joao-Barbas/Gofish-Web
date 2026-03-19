using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class PostVote
{
    #region Scalar Properties

    public DateTime CreatedAt { get; set; }
    public VoteKind Value { get; set; }

    [ForeignKey(nameof(Post))]
    public int PostId { get; set; }

    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; } = default!;

    #endregion
    #region Navigation Properties

    public Post Post { get; set; } = default!;
    public AppUser AppUser { get; set; } = default!;

    #endregion
}