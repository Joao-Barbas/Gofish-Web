using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public abstract class Pin
{
    #region Scalar Properties

    [Key]
    public int Id { get; set; }

    [Range(-90, 90)]
    public required double Latitude { get; set; }

    [Range(-180, 180)]
    public required double Longitude { get; set; }

    public required DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; } // Info pin does not expire
    public required VisibilityLevel Visibility { get; set; }
    public required PinKind Kind { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    #endregion
    #region Navigation Properties

    public AppUser AppUser { get; set; } = null!;
    public Post Post { get; set; } = null!;

    #endregion
}
