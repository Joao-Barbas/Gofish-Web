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
    public int UpVotes { get; set; } = 0;
    public int DownVotes { get; set; } = 0;

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    #endregion
    #region Navigation Properties

    public AppUser AppUser { get; set; } = null!;
    public Pin Pin { get; set; } = null!;
    // public /* virtual // Maybe? */ ICollection<Comment> Comments { get; set; } = new(); // TODO

    #endregion
    #region Computed Properties

    public int Score => UpVotes - DownVotes;

    #endregion
}
