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

public record SearchGroupDto(
    int Id,
    string Name,
    string? Description,
    string? AvatarUrl,
    int PostCount,
    int MemberCount
)
{
    public static SearchGroupDto FromEntity(Group g) => new(
        g.Id,
        g.Name,
        g.Description,
        g.AvatarUrl,
        g.GroupPins.Count,
        g.GroupUsers.Count
    );
}

public record GroupDto
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required int MemberCount { get; init; }
    public required int PinCount { get; init; }
    public required GroupMemberDto Owner { get; init; }
    public required bool IsCurrentUserMember { get; init; }
    public GroupMemberDto? CurrentUserMembership { get; init; }
    public string? Description { get; init; }
    public string? AvatarUrl { get; init; }
}

public record GroupInviteDto
{
    public required int Id { get; init; }
    public required GroupDto Group { get; init; }
    public required FriendshipState InviteState { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required GroupMemberDto Requester { get; init; }

    // public static GroupInviteDto FromProjection(dynamic i) => new()
    // {
        // (int)i.Id,
        // (int)i.GroupId,
        // (string)i.GroupName,
        // (string?)i.GroupAvatarUrl,
        // (FriendshipState)i.State,
        // (DateTime)i.CreatedAt,
        // new GroupInviteUserDto(
        //     (string)i.RequesterId,
        //     (string)(i.RequesterUserName ?? ""),
        //     (string)(i.RequesterFirstName ?? ""),
        //     (string)(i.RequesterLastName ?? ""),
        //     (string?)i.RequesterAvatarUrl
        // )
    // };
}

#endregion // View Models
#region Requests

public record SearchGroupsReqDto(
    string Query,
    int MaxResults = 20,
    string? LastGroupName = null
);

#endregion // Requests
#region Responses

public record SearchGroupsResDto(
    IEnumerable<SearchGroupDto> Groups,
    bool HasMoreResults,
    string? LastGroupName
);

public record UpdateGroupMemberRoleResDto(
    int GroupId,
    string UserId,
    string Role,
    string Message
);

#endregion // Responses

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

public record GetGroupPinsReqDto(
    int GroupId,
    PinKind? Kind = null,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

public record GetGroupPinsResDto(
    IEnumerable<PinDto> Pins,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

#endregion // GetGroupPosts
