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
    string? Description { get; }
}

public sealed class PinReport : IReport
{
    [Key]
    public required int Id { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [ForeignKey(nameof(Pin))]
    public required int PinId { get; set; }

    public required PinReportReason Reason { get; set; }

    public required DateTime CreatedAt { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    // Navigation 

    public AppUser AppUser { get; set; } = default!;
    public Pin Pin { get; set; } = default!;

    // Computed

    public string ReasonText => Reason.GetDisplayName();
}

public sealed class CommentReport : IReport
{
    [Key]
    public required int Id { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [ForeignKey(nameof(Comment))]
    public required int CommentId { get; set; }

    public required CommentReportReason Reason { get; set; }
    
    public required DateTime CreatedAt { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    // Navigation 

    public AppUser AppUser { get; set; } = default!;
    public Comment Comment { get; set; } = default!;

    // Computed

    public string ReasonText => Reason.GetDisplayName();
}



