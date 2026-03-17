using GofishApi.Enums;

namespace GofishApi.Dtos;

public record GetFeedReqDTO(
    FeedKind Kind,
    PostDataRequestDTO? DataRequest,
    DateTime LastTimestamp,
    int MaxResults
)
{ }

public record GetFeedResDTO(
    IReadOnlyCollection<GetPostsPostDTO> Posts,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

