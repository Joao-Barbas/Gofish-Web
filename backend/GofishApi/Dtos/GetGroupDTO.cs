using GofishApi.Models;
using System.Threading;
using static GofishApi.Dtos.GetGroupDTO;

namespace GofishApi.Dtos;

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
    int PostCount,
    IReadOnlyCollection<GetPostsPostDTO>? Posts,
    IReadOnlyCollection<GetGroupMemberDTO>? Members
)
{
    public static GetGroupDTO FromGroup(Group group, GroupDataRequestDTO? request) => new(
        group.Id,
        group.Name,
        group.AvatarUrl,
        group.Description,
        group.AppUsers?.Count ?? 0,
        group.Posts?.Count ?? 0,
        request?.IncludePosts ?? true ? group.Posts?
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => GetPostsPostDTO.FromPost(p, null))
            .ToList() : null,
        request?.IncludeMembers ?? true ? group.AppUsers?
            .Select(GetGroupMemberDTO.FromUser)
            .ToList() : null
    );

    #endregion

    #region SubDTOs

    public record GetGroupMemberDTO(
        string Id,
        string UserName,
        string? AvatarUrl
    )
    {
        public static GetGroupMemberDTO FromUser(AppUser user) => new(
            user.Id,
            user.UserName ?? "",
            user.UserProfile.AvatarUrl
        );
    }

    #endregion
}