using Azure.Core;
using GofishApi.Enums;
using GofishApi.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Net.NetworkInformation;
using System.Text.Json.Serialization;

namespace GofishApi.Dtos;

#region View Models

public record PinGeolocationDto (
    double Latitude,
    double Longitude
)
{
    public static PinGeolocationDto FromEntity(Pin p) => new(
        p.Latitude,
        p.Longitude
    );
}

public record PinDetailsDto (
    // Catch pin
    Species? Species = null,
    Bait? Bait = null,
    string? HookSize = null,
    // Information pin
    AccessDifficulty? AccessDifficulty = null,
    Seabed? Seabed = null,
    // Warning pin
    WarningKind? WarningKind = null
)
{
    public static PinDetailsDto FromEntity(Pin p) => new(
        // Catch pin
        (p as CatchPin)?.Species,
        (p as CatchPin)?.Bait,
        (p as CatchPin)?.HookSize,
        // Information pin
        (p as InfoPin)?.AccessDifficulty,
        (p as InfoPin)?.Seabed,
        // Warning pin
        (p as WarnPin)?.WarningKind
    );
}

public record PinAuthorDto
{
    // Rank (??)
    // Catch points (???)

    public required string Id { get; init; }
    public required string UserName { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }

    public string? AvatarUrl { get; init; }
    public GroupRole? GroupRole { get; init; }

    public static PinAuthorDto FromEntity(AppUser u, UserProfile up) => new()
    {
        Id        = u.Id,
        UserName  = u.UserName ?? "",
        FirstName = u.FirstName ?? "",
        LastName  = u.LastName ?? "",
        AvatarUrl = up.AvatarUrl
    };

    public static PinAuthorDto FromEntity(AppUser u, UserProfile up, GroupUser gu) => new()
    {
        Id        = u.Id,
        UserName  = u.UserName ?? "",
        FirstName = u.FirstName ?? "",
        LastName  = u.LastName ?? "",
        AvatarUrl = up?.AvatarUrl,
        GroupRole = gu.Role
    };
}

public record PinStatsDto(
    VoteKind? CurrentUserVote,
    int Score = 0,
    int CommentCount = 0
)
{ }

public record PinUgcDto (
    string? Body,
    string? ImageUrl
)
{
    public static PinUgcDto FromEntity(Pin p) => new(
        p.Body,
        p.ImageUrl);
}

public record PinDto(
    int Id,
    DateTime CreatedAt,
    VisibilityLevel Visibility,
    PinKind Kind
)
{
    public PinGeolocationDto? Geolocation { get; init; }
    public PinAuthorDto? Author { get; init; }
    public PinDetailsDto? Details { get; init; }
    public PinStatsDto? Stats { get; init; }
    public PinUgcDto? Ugc { get; init; }
    public List<CommentDto>? Comments { get; set; }

    public static PinDto FromEntity(Pin p) => new(
        p.Id,
        p.CreatedAt,
        p.Visibility,
        p.Kind);

    public PinDto SetGeolocation(Pin p) => this with { Geolocation = PinGeolocationDto.FromEntity(p) };
    public PinDto SetAuthor(AppUser u, UserProfile up) => this with { Author = PinAuthorDto.FromEntity(u, up) };
    public PinDto SetAuthor(AppUser u, UserProfile up, GroupUser gu) => this with { Author = PinAuthorDto.FromEntity(u, up, gu) };
    public PinDto SetDetails(Pin p) => this with { Details = PinDetailsDto.FromEntity(p) };
    public PinDto SetStats(PinStatsDto dto) => this with { Stats = dto };
    public PinDto SetUgc(Pin p) => this with { Ugc = PinUgcDto.FromEntity(p) };
    public PinDto SetComments(List<CommentDto> c) => this with { Comments = c };
}

public record CommentAuthorDto(
    string Id,
    string UserName,
    string? AvatarUrl
)
{
    public static CommentAuthorDto FromEntity(AppUser u) => new(
        u.Id,
        u.UserName ?? "",
        u.UserProfile?.AvatarUrl
    );
}

public record CommentDto(
    int Id,
    string Body,
    DateTime CreatedAt,
    CommentAuthorDto Author
)
{
    public static CommentDto FromEntity(Comment c) => new(
        c.Id,
        c.Body,
        c.CreatedAt,
        CommentAuthorDto.FromEntity(c.AppUser)
    );
}

#endregion // View Models
#region Request Helpers

/// <param name="PinId">The unique identifier of a specific pin to retrieve.</param>
/// <param name="AuthorId">The user identifier of the author. Retrieves all pins belonging to this user.</param>
/// <param name="GroupId">The group identified. Retrieves all pins belonging to this group.</param>
public record GetPinsIdDto(
    int? PinId,
    string? AuthorId,
    int? GroupId
);

public record GetPinsDataRequestDto(
    bool? IncludeGeolocation = false,
    bool? IncludeAuthor = false,
    bool? IncludeDetails = false,
    bool? IncludeStats = false,
    bool? IncludeUgc = false, // IncludeBody + IncludeImage
    bool? IncludeGroups = false,
    bool? IncludeComments = false
);

#endregion // Request Helpers
#region Requests

public record GetInViewportReqDto(
    double MinLat,
    double MinLng,
    double MaxLat,
    double MaxLng
)
{ }

public record GetFeedReqDto(
    FeedKind Kind,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

public record GetPinsReqDto(
    IEnumerable<GetPinsIdDto> Ids,
    GetPinsDataRequestDto? DataRequest,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
)
{ }

public record VoteReqDto(
    [Required] VoteKind Value
)
{ }

public record CreateCommentReqDto(
    int PinId,
    string Body
)
{ }

public record CreateCatchPinReqDto (
    double Latitude,
    double Longitude,
    VisibilityLevel Visibility,
    IEnumerable<int>? GroupIds,
    string? Body,
    // Catch pin exclusives
    IFormFile Image,
    Species? Species,
    Bait? Bait,
    string? HookSize
)
{ }

public record CreateInfoPinReqDto(
    double Latitude,
    double Longitude,
    VisibilityLevel Visibility,
    IEnumerable<int>? GroupIds,
    string? Body,
    // Information pin exclusives
    AccessDifficulty AccessDifficulty,
    Seabed Seabed
)
{ }

public record CreateWarnPinReqDto(
    double Latitude,
    double Longitude,
    VisibilityLevel Visibility,
    IEnumerable<int>? GroupIds,
    string? Body,
    // Warning pin exclusives
    WarningKind WarningKind
)
{ }

public record GetCommentsReqDto(
    int PinId,
    int MaxResults = 20,
    DateTime? LastTimestamp = null
);

#endregion // Requests
#region Responses

public record GetInViewportResDto(
    IEnumerable<PinDto> Pins
)
{ }

public record GetFeedResDto(
    IEnumerable<PinDto> Pins,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

public record GetPinsResDto(
    IReadOnlyCollection<PinDto> Pins,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

public record VoteResDto(
    VoteKind? UserVote,
    int NewScore
)
{ }

public record CreateCommentResDto(
    int Id
)
{ }

public record CreatePinResDto(
    int Id
)
{ }

public record GetCommentsResDto(
    IEnumerable<CommentDto> Comments,
    bool HasMoreResults,
    DateTime? LastTimestamp
);

#endregion // Responses
