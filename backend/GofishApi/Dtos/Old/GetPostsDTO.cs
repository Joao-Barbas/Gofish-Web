/*
using GofishApi.Enums;
using GofishApi.Models;
using System.Net.NetworkInformation;

namespace GofishApi.Dtos;

public record GetPostsReqDTO(
    IReadOnlyCollection<PostIdDTO>? Ids,
    PostDataRequestDTO? DataRequest,
    DateTime LastTimestamp,
    int MaxResults
);

public record GetPostsResDTO(
    IReadOnlyCollection<GetPostsPostDTO> Posts,
    bool HasMoreResults,
    DateTime? LastTimestamp
);

#region Request

public record PostIdDTO(
    int? PostId,
    string? AuthorId,
    int? GroupId
);

public record PostDataRequestDTO(
    bool? IncludeAuthor = false,
    bool? IncludeGroups = false,
    bool? IncludeComments = false,
    bool? IncludeCoords = false
);

#endregion
#region Response

public record GetPostsPostDTO(
    int Id,
    DateTime CreatedAt,
    string? Body,
    string? ImageUrl,
    int Score,
    int CommentCount,
    int? UserVote,
    PinKind Kind,
    // Warning
    WarningKind? WarningKind,
    // Info
    AccessDifficulty? AccessDifficulty,
    Seabed? Seabed,
    // Catch
    Species? Species,
    Bait? Bait,
    string? HookSize,
    GetPostsAuthorDTO? Author,
    IReadOnlyCollection<GetPostsCommentDTO>? Comments,
    IReadOnlyCollection<GetPostsGroupDTO>? Groups,
    GetPostsCoordsDTO? Coords
)
{
    public static GetPostsPostDTO FromPost(Post post, PostDataRequestDTO? request, string? currentUserId)
    {
        var warnPin = post.Pin as WarnPin;
        var infoPin = post.Pin as InfoPin;
        var catchPin = post.Pin as CatchPin;

        return new GetPostsPostDTO(
            post.Id,
            post.CreatedAt,
            post.Body,
            post.ImageUrl,
            post.PostVotes.Sum(v => (int)v.Value),
            post.CommentCount,
            post.PostVotes
                .Where(v => v.UserId == currentUserId)
                .Select(v => (int?)v.Value)
                .FirstOrDefault(),
            post.Pin.Kind,
            // Warning
            warnPin?.WarningKind,
            // Info
            infoPin?.AccessDifficulty,
            infoPin?.Seabed,
            // Catch
            catchPin?.Species,
            catchPin?.Bait,
            catchPin?.HookSize,
            request?.IncludeAuthor ?? false ? GetPostsAuthorDTO.FromUser(post.AppUser) : null,
            request?.IncludeComments ?? false ? post.Comments.Select(GetPostsCommentDTO.FromComment).ToList() : null,
            request?.IncludeGroups ?? false ? post.Groups.Select(GetPostsGroupDTO.FromGroup).ToList() : null,
            request?.IncludeCoords ?? false ? GetPostsCoordsDTO.FromPost(post) : null
        );
    }
}

#endregion

#region SubDTOs

public record GetPostsAuthorDTO(
    string Id,
    string UserName,
    string FirstName,
    string LastName,
    string? AvatarUrl
)
{
    public static GetPostsAuthorDTO FromUser(AppUser user) => new(
        user.Id,
        user.UserName ?? "",
        user.FirstName ?? "",
        user.LastName ?? "",
        user.UserProfile.AvatarUrl
    );
}

public record GetPostsGroupDTO(
    int Id,
    string Name
)
{
    public static GetPostsGroupDTO FromGroup(Group group) => new(
        group.Id,
        group.Name
    );
}

public record GetPostsCommentDTO(
    int Id,
    string Body,
    DateTime CreatedAt,
    string UserId,
    string UserName,
    string? AvatarUrl
)
{
    public static GetPostsCommentDTO FromComment(PostComment comment) => new(
        comment.Id,
        comment.Body,
        comment.CreatedAt,
        comment.AppUser.Id,
        comment.AppUser.UserName ?? "",
        comment.AppUser.UserProfile.AvatarUrl
    );
}

public record GetPostsCoordsDTO(
    double Latitude,
    double Longitude
)
{
    public static GetPostsCoordsDTO FromPost(Post post) => new(
        post.Pin.Latitude,
        post.Pin.Longitude
    );
}

#endregion
*/
