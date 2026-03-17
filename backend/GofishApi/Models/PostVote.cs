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

    [Range(-1, 1)]
    public int Value { get; set; }

    #endregion

    #region Navigation Properties

    public Post Post { get; set; } = null!;

    public AppUser AppUser { get; set; } = null!;

    #endregion
}