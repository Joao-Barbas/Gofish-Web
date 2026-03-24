using System.ComponentModel.DataAnnotations;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record GetUserProfileReqDTO(
    // Unused
)
{ }

public record GetUserProfileResDto(
    string UserId,
    string FirstName,
    string LastName,
    string UserName,
    int FishingScore,
    string? Bio,
    string? AvatarUrl,
    DateTime JoinedAt,
    DateTime LastActiveAt,
    int WeeklyStreak
)
{
    public static GetUserProfileResDto FromEntity(UserProfile e) => new(
        e.UserId,
        e.AppUser.FirstName ?? "",
        e.AppUser.LastName ?? "",
        e.AppUser.UserName ?? "",
        e.FishingScore,
        e.Bio,
        e.AvatarUrl,
        e.JoinedAt,
        e.LastActiveAt,
        e.WeeklyStreak
    );
}

public record GetUserProfileSettingsReqDto(
// Unused
)
{ }

public record GetUserProfileSettingsResDto(
    string? Bio,
    string? AvatarUrl
)
{
    public static GetUserProfileSettingsResDto FromEntity(UserProfile e) => new(
        e.Bio,
        e.AvatarUrl
    );
}

public record PutUserProfileReqDto(
    [Required] string Bio,
    [Required] string AvatarUrl
)
{ }

public record PatchUserProfileReqDto(
    string? Bio,
    string? AvatarUrl
)
{ }
