using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record CreatePinReportReqDTO(
    int PinId,
    PinReportReason Reason,
    string? Description
);

public record CreatePinReportResDTO(
    int Id
);

public record CreateCommentReportReqDTO(
    int CommentId,
    CommentReportReason Reason,
    string? Description
);

public record CreateCommentReportResDTO(
    int Id
);

public record GetReportResDTO(
    int Id,
    string UserId,
    string? ImageURL,
    string? Username,
    string Type,
    int TargetId,
    string ReasonText,
    string? Description,
    DateTime CreatedAt
);

public record GetReportReqDTO(
    int MaxResults = 20,
    DateTime? LastCreatedAt = null
);

public record GetReportsResDTO(
    IEnumerable<GetReportResDTO> Reports,
    bool HasMoreResults,
    DateTime? LastCreatedAt
);

public record GetPinReportsByPinReqDTO(
    int PinId,
    int MaxResults = 20,
    DateTime? LastCreatedAt = null
);

public record DeleteReportsReqDTO
(
    IEnumerable<int> Ids
);

public record GetCommentsReportsByCommentReqDTO(
    int CommentId,
    int MaxResults = 20,
    DateTime? LastCreatedAt = null
);
