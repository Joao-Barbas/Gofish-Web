using GofishApi.Models;
using Microsoft.OpenApi.Extensions;
using System.Threading;
using static GofishApi.Dtos.GetGroupDTO;

namespace GofishApi.Dtos;

public record GetUserGroupsResDTO(
    IReadOnlyCollection<GetGroupDTO> Groups
);

public record GetGroupReqDTO(
    int GroupId,
    GroupDataRequestDTO? DataRequest
);

public record GetGroupResDTO(
    GetGroupDTO Group
);

#region Request

public record GroupDataRequestDTO(
    bool? IncludePosts = true,
    bool? IncludeMembers = true
);

#endregion

#region Response

public record GetGroupDTO(
    int Id,
    string Name,
    string? ImageUrl,
    string? Description,
    int MemberCount,
    int PostCount
)
{
    public static GetGroupDTO FromGroup(Group group, GroupDataRequestDTO? request) => new(
        group.Id,
        group.Name,
        group.AvatarUrl,
        group.Description,
        group.AppUsers?.Count ?? 0,
        group.Pins?.Count ?? 0
    );

    #endregion

    #region SubDTOs

    public record GetGroupMemberDTO(
        string Id,
        string UserName,
        string UserRole,
        string? AvatarUrl
    )
    {
        public static GetGroupMemberDTO FromGroupUser(GroupUser gu) => new(
            gu.UserId,
            gu.AppUser.UserName ?? "",
            gu.Role.GetDisplayName(),
            gu.AppUser.UserProfile.AvatarUrl
        );
    }

    #endregion
}