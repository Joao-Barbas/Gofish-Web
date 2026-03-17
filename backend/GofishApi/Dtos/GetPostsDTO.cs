using GofishApi.Enums;
using GofishApi.Models;

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
    bool? IncludeComments = false
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
    PinKind Kind,
    WarningKind? WarningKind,


    GetPostsAuthorDTO? Author,
    IReadOnlyCollection<GetPostsCommentDTO>? Comments,
    IReadOnlyCollection<GetPostsGroupDTO>? Groups
)
{
    public static GetPostsPostDTO FromPost(Post post, PostDataRequestDTO? request) => new(
        post.Id,
        post.CreatedAt,
        post.Body,
        post.ImageUrl,
        post.PostVotes.Sum(v => (int)v.Value),
        post.CommentCount,
        post.Pin.Kind,
        post.Pin is WarnPin warnPin ? warnPin.WarningKind : null,

        request?.IncludeAuthor ?? false ? GetPostsAuthorDTO.FromUser(post.AppUser) : null,
        request?.IncludeComments ?? false ? post.Comments.Select(GetPostsCommentDTO.FromComment).ToList() : null,
        request?.IncludeGroups ?? false ? post.Groups.Select(GetPostsGroupDTO.FromGroup).ToList() : null
        );
}

#endregion

#region SubDTOs

public record GetPostsAuthorDTO(
    string Id,
    string UserName
)
{
    public static GetPostsAuthorDTO FromUser(AppUser user) => new(
        user.Id,
        user.UserName ?? ""
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
    string UserName
)
{
    public static GetPostsCommentDTO FromComment(PostComment comment) => new(
        comment.Id,
        comment.Body,
        comment.CreatedAt,
        comment.AppUser.Id,
        comment.AppUser.UserName ?? ""
    );
}

/*
public record GetPostsVoteDTO(
    int PostId,
    string UserId,
    string UserName,
    int Value
)
{
    public static GetPostsVoteDTO FromVote(PostVote vote) => new(
        vote.PostId,
        vote.UserId,
        vote.AppUser.UserName ?? "",
        vote.Value
    );
}
*/

#endregion
