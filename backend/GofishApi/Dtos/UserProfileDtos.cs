using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Services;

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
    int CatchPoints,
    int Rank,
    string? Bio,
    string? AvatarUrl,
    DateTime JoinedAt,
    DateTime LastActiveAt,
    FriendshipState? FriendshipState,
    int WeeklyStreak,
    int MaxWeeklySteak,
    int PinsCount,
    int FriendsCount,
    int GroupsCount
)
{
    public static GetUserProfileResDto FromEntity(UserProfile e, FriendshipState? friendshipState) => new(
        e.UserId,
        e.AppUser.FirstName ?? "",
        e.AppUser.LastName ?? "",
        e.AppUser.UserName ?? "",
        e.CatchPoints,
        GamificationService.GetRank(e.CatchPoints),
        e.Bio,
        e.AvatarUrl,
        e.JoinedAt,
        e.LastActiveAt,
        friendshipState,
        e.WeeklyStreak,
        e.MaxWeeklyStreak,
        0,
        0,
        0
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
    [Required] IFormFile Avatar
)
{ }

public record PatchUserProfileReqDto(
    string? Bio,
    IFormFile? Avatar
)
{ }
