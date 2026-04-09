using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using GofishApi.Enums;

namespace GofishApi.Models;

public abstract class Pin
{
    // | Case                            | Use             |
    // | ------------------------------- | --------------- |
    // | Required scalar(like `UserId`)  | required        |
    // | Navigation property             | = null!         |
    // | Optional property               | neither(?)      |

    #region Scalar Properties

    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [Range(-90, 90)]
    public required double Latitude { get; set; }

    [Range(-180, 180)]
    public required double Longitude { get; set; }

    public required PinKind Kind { get; set; }

    public required VisibilityLevel Visibility { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required DateTime ExpiresAt { get; set; }

    public int Score { get; set; }

    [MaxLength(2000)]
    public string? Body { get; set; }

    [Url]
    [MaxLength(2000)]
    public string? ImageUrl { get; set; }

    #endregion
    #region Navigation Properties

    public AppUser AppUser { get; set; } = null!;

    public List<Vote> Votes { get; set; } = new();

    public List<Comment> Comments { get; set; } = new();

    public List<Group> Groups { get; set; } = new();
    
    public List<GroupPin> GroupPins { get; set; } = new();

    #endregion
    #region Computed Properties

    public int CommentCount => Comments.Count;

    #endregion
}
