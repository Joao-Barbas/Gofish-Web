using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Dtos;

#region View Models

public record GroupMemberDto(
    string UserId,
    string UserName,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    GroupRole Role,
    DateTime JoinedAt
)
{
    public static GroupMemberDto FromEntity(GroupUser gu) => new(
        gu.AppUser.Id,
        gu.AppUser.UserName ?? "",
        gu.AppUser.FirstName ?? "",
        gu.AppUser.LastName ?? "",
        gu.AppUser.UserProfile?.AvatarUrl,
        gu.Role,
        gu.JoinedAt
    );
}

public record GroupPostPinDto(
    PinKind Kind,
    VisibilityLevel Visibility,
    DateTime? ExpiresAt,
    GetPinsPinDetailsDTO Details,
    GetPinsGeolocationDTO Geolocation
)
{
    public static GroupPostPinDto FromEntity(Pin pin) => new(
        pin.Kind,
        pin.Visibility,
        pin.ExpiresAt,
        GetPinsPinDetailsDTO.FromPin(pin),
        GetPinsGeolocationDTO.FromPin(pin)
    );
}

public record GroupPostDto(
    int Id,
    string? Body,
    string? ImageUrl,
    DateTime CreatedAt,
    int Score,
    int CommentCount,
    VoteKind? UserVote,
    GroupMemberDto Author,
    GroupPostPinDto Pin
)
{
    public static GroupPostDto FromEntity(Post post, GroupUser groupUser, string userId) => new(
        post.Id,
        post.Body,
        post.ImageUrl,
        post.CreatedAt,
        post.PostVotes.Sum(v => (int)v.Value),
        post.CommentCount,
        post.PostVotes
            .Where(v => v.UserId == userId)
            .Select(v => (VoteKind?)v.Value)
            .FirstOrDefault(),
        GroupMemberDto.FromEntity(groupUser),
        GroupPostPinDto.FromEntity(post.Pin)
    );
}

#endregion // View Models
#region GetGroupMembers

public record GetGroupMembersReqDto(
    int GroupId,
    GroupRole? Role = null,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

public record GetGroupMembersResDto(
    IEnumerable<GroupMemberDto> Members,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

#endregion // GetGroupMembers
#region GetGroupPosts

public record GetGroupPostsReqDto(
    int GroupId,
    PinKind? Kind = null,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

public record GetGroupPostsResDto(
    IEnumerable<GroupPostDto> Posts,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

#endregion // GetGroupPosts
