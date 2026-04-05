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
#region Request Wrappers

public record GetUserProfileReqDTO { } // Unused

public record GetUserProfileSettingsReqDto { } // Unused

public record PutUserProfileReqDto
{
    [Required] public required string Bio { get; init; }
    [Required] public required IFormFile Avatar { get; init; }
}

public record PatchUserProfileReqDto
{
    public string? Bio { get; init; }
    public IFormFile? Avatar { get; init; }
}

#endregion // Request Wrappers
#region Response Wrappers

public record GetUserProfileSettingsResDto
{
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }

    public static GetUserProfileSettingsResDto FromEntity(UserProfile e) => new()
    {
        Bio = e.Bio,
        AvatarUrl = e.AvatarUrl
    };
}

#endregion // Response Wrappers
