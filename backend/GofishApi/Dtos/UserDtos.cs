using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Services;

namespace GofishApi.Dtos;

#region View Models

public record LeaderboardUserDto
{
    public required int Position { get; init; }
    public required string UserId { get; init; }
    public required string UserName { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required int CatchPoints { get; init; }
    public required int CatchPointsDelta { get; init; }
    public required int WeeklyStreak { get; init; }
    public required int Rank { get; init; }
    public string? AvatarUrl { get; init; }
}

public record SearchUserDto
{
    public required string Id { get; init; }
    public required string UserName { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public int? CatchPoints { get; init; }
    public int? Rank { get; init; }
    public string? AvatarUrl { get; init; }
}

public record FriendshipUserDto(
    string UserId,
    string UserName,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    int? CatchPoints,
    int? Rank
)
{
    public static FriendshipUserDto FromEntity(AppUser u) => new(
        u.Id,
        u.UserName ?? "",
        u.FirstName ?? "",
        u.LastName ?? "",
        u.UserProfile.AvatarUrl,
        u.UserProfile.CatchPoints,
        GamificationService.GetRank(u.UserProfile.CatchPoints)
    );
}

public record FriendshipDto(
    int Id,
    string RequesterUserId,
    string ReceiverUserId,
    FriendshipState State,
    DateTime CreatedAt,
    DateTime? RepliedAt,
    FriendshipUserDto Requester,
    FriendshipUserDto Receiver
)
{
    public static FriendshipDto FromEntity(Friendship e) => new(
        e.Id,
        e.RequesterUserId,
        e.ReceiverUserId,
        e.State,
        e.CreatedAt,
        e.RepliedAt,
        FriendshipUserDto.FromEntity(e.Requester),
        FriendshipUserDto.FromEntity(e.Receiver)
    );
}

public record UserGroupDto(
    int Id,
    string Name,
    string? Description,
    string? AvatarUrl,
    DateTime CreatedAt
)
{
    public GroupRole Role { get; init; }
    public int MemberQty { get; init; }
    public int PostQty { get; init; }

    public static UserGroupDto FromEntity(Group g) => new(
        g.Id,
        g.Name,
        g.Description,
        g.AvatarUrl,
        g.CreatedAt
    );

    public UserGroupDto SetRole(GroupRole role) => new(this) { Role = role };
    public UserGroupDto SetMemberQty(int memberQty) => new(this) { MemberQty = memberQty };
    public UserGroupDto SetPinQty(int postQty) => new(this) { PostQty = postQty };
}

#endregion
#region Requests

public record SearchUsersReqDto(
    string Query,
    int MaxResults = 20,
    string? LastUsername = null
)
{ }

public record GetUserReqDto(
// Unused
)
{ }

public record GetUserSettingsReqDto(
// Unused
)
{ }

public record PutUserReqDto(
    [Required] string UserName,
    [Required] string PhoneNumber,
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string Email
)
{ }

public record PatchUserReqDto(
    string? UserName,
    string? PhoneNumber,
    string? FirstName,
    string? LastName,
    string? Email
)
{ }

public record GetFriendshipsReqDto(
    string? UserId = null,
    FriendshipState? State = null,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

public record GetFriendshipBetweenReqDto(
    string UserId1,
    string UserId2
)
{ }

public record RequestFriendshipReqDto(
    string ReceiverId
)
{ }

public record GetUserGroupReqDto(
    string? UserId = null,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

#endregion
#region Responses

public record GetUserPointsResDto
{
    public required int Points { get; init; }
}

public record SearchUsersResDto(
    IEnumerable<SearchUserDto> Users,
    bool HasMoreResults,
    string? LastUsername
)
{ }

public record GetUserResDto(
    string UserName,
    string FirstName,
    string LastName,
    FriendshipState? FriendshipState
)
{
    public static GetUserResDto FromEntity(AppUser u, FriendshipState? friendshipState) => new(
        u.UserName ?? "",
        u.FirstName ?? "",
        u.LastName ?? "",
        friendshipState
    );
}

public record GetUserSettingsResDto(
    string UserName,
    string FirstName,
    string LastName,
    string? Email,
    string? PhoneNumber,
    bool EmailConfirmed,
    bool PhoneNumberConfirmed
)
{
    public static GetUserSettingsResDto FromEntity(AppUser u) => new(
        u.UserName ?? "",
        u.FirstName ?? "",
        u.LastName ?? "",
        null,
        null,
        u.EmailConfirmed,
        u.PhoneNumberConfirmed
    );
}

public record LeaderboardResDto(
    IReadOnlyCollection<LeaderboardUserDto> Entries,
    LeaderboardUserDto? CurrentUser
);

public record PutUserResDto(
// Unused
)
{ }

public record PatchUserResDto(
// Unused
)
{ }

public record GetFriendshipsResDto(
    IEnumerable<FriendshipDto> Friendships,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

public record RequestFriendshipResDto(
    int Id
)
{ }

public record GetFriendshipBetweenResDto(
    // Unused
)
{ }

public record GetUserGroupResDto(
    IEnumerable<UserGroupDto> Groups,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

#endregion
