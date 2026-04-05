using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Services;

namespace GofishApi.Dtos;

#region View Models

public record UserProfileDto
{
    public required string UserId { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string UserName { get; init; }
    public required int CatchPoints { get; init; }
    public required int Rank { get; init; }
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }
    public required DateTime JoinedAt { get; init; }
    public required DateTime LastActiveAt { get; init; }
    public FriendshipDto? Friendship { get; init; }
    public required int WeeklyStreak { get; init; }
    public required int MaxWeeklySteak { get; init; }
    public int PinsCount { get; init; }
    public int FriendsCount { get; init; }
    public int GroupsCount { get; init; }
}

#endregion // View Models

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
