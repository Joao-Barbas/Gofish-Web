using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class PinReport
{
    #region Scalar

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public PinReportType Type { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [ForeignKey(nameof(Pin))]
    public int PinId { get; set; }

    #endregion

    #region Navigation

    public AppUser AppUser { get; set; } = null!;
    public Pin Pin { get; set; } = null!;

    #endregion

}
