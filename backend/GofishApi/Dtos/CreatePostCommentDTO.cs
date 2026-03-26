namespace GofishApi.Dtos
{
    public record CreatePostCommentReqDTO(
        int PostId,
        string Body
    );

    public record CreatePostCommentResDTO(
        int Id
    );
}
