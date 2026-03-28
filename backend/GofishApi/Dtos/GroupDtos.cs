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
