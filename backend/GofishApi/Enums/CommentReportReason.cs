using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum CommentReportReason
{
    [Display(Name="Spam")]            Spam            = 0,
    [Display(Name="Inappropriate")]   Inappropriate   = 1,
    [Display(Name="Harassment")]      Harassment      = 2,
    [Display(Name="Missinformation")] Missinformation = 3,
    [Display(Name="Off topic")]       OffTopic        = 4,
}
