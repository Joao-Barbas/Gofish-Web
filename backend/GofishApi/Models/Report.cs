using GofishApi.Enums;
using Microsoft.OpenApi.Extensions;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public interface IReport 
{
    int Id { get; }
    string ReasonText { get; }
    DateTime CreatedAt { get; }
    string UserId { get; }
}

public sealed class PinReport : IReport
{
    public int Id { get; set; }

    public PinReportReason Reason { get; set; }
    public string ReasonText => Reason.GetDisplayName();
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; } = default!;

    [ForeignKey(nameof(Pin))]
    public int PinId { get; set; }

    // Navigation 

    public AppUser AppUser { get; set; } = default!;
    public Pin Pin { get; set; } = default!;

}

public sealed class CommentReport : IReport
{
    public int Id { get; set; }

    public CommentReportReason Reason { get; set; }
    public string ReasonText => Reason.GetDisplayName();
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(AppUser))]
    public string UserId { get; set; } = default!;

    [ForeignKey(nameof(Comment))]
    public int CommentId { get; set; }

    // Navigation 

    public AppUser AppUser { get; set; } = default!;
    public PostComment Comment { get; set; } = default!;
}



