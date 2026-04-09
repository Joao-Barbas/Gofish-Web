//using GofishApi.Enums;
//using GofishApi.Models;
//using Microsoft.Extensions.Hosting;
//
//namespace GofishApi.Dtos;
//
//public record GetPinsReqDTO(
//    IReadOnlyCollection<PinIdDTO> Ids,
//    PinDataRequestDTO? DataRequest,
//    int MaxResults = 20,
//    DateTime? LastTimestamp = null
//);
//
//public record GetPinsResDTO(
//    IReadOnlyCollection<GetPinsPinDTO> Pins,
//    bool HasMoreResults,
//    DateTime? LastTimestamp
//);
//
//#region Request
//
///// <param name="PinId">The unique identifier of a specific pin to retrieve.</param>
///// <param name="AuthorId">The user identifier of the author. Retrieves all pins belonging to this user.</param>
///// <param name="GroupId">The group identified. Retrieves all pins belonging to this group.</param>
//public record PinIdDTO(
//    int? PinId,
//    string? AuthorId,
//    int? GroupId
//);
//
//public record PinDataRequestDTO(
//    bool? IncludeGeolocation = false,
//    bool? IncludeAuthor = false,
//    bool? IncludePost = false,
//    bool? IncludeDetails = false,
//    bool? IncludeGroups = false // TODO: List the groups this pins is part of if group visibility
//);
//
//#endregion
//#region Response
//
//public record GetPinsPinDTO(
//    int Id,
//    DateTime CreatedAt,
//    VisibilityLevel Visibility,
//    PinKind Kind,
//    // Optional includes
//    GetPinsPinDetailsDTO? Details,
//    GetPinsGeolocationDTO? Geolocation,
//    GetPinsAuthorDTO? Author,
//    GetPinsPostDTO? Post
//    // TODO: GroupDTO? List of group this pin could be part of if group visibility
//){
//    public static GetPinsPinDTO FromPin(Pin pin, PinDataRequestDTO? request, string? currentUserId) => new(
//        pin.Id,
//        pin.CreatedAt,
//        pin.Visibility,
//        pin.Kind,
//        (request?.IncludeDetails ?? false) ? GetPinsPinDetailsDTO.FromPin(pin) : null,
//        (request?.IncludeGeolocation ?? false) ? GetPinsGeolocationDTO.FromPin(pin) : null,
//        (request?.IncludeAuthor ?? false) ? GetPinsAuthorDTO.FromPin(pin) : null,
//        (request?.IncludePost ?? false) ? GetPinsPostDTO.FromPin(pin, currentUserId) : null
//    );
//};
//
//public record GetPinsGeolocationDTO(
//    double Latitude,
//    double Longitude
//){
//    public static GetPinsGeolocationDTO FromPin(Pin pin) => new(
//        pin.Latitude,
//        pin.Longitude
//    );
//};
//
//public record GetPinsAuthorDTO(
//    string Id,
//    string UserName,
//    string FirstName,
//    string LastName,
//    string? AvatarUrl
//){
//    public static GetPinsAuthorDTO FromPin(Pin pin) => new(
//        pin.AppUser.Id,
//        pin.AppUser.UserName ?? "",
//        pin.AppUser.FirstName ?? "",
//        pin.AppUser.LastName ?? "",
//        pin.AppUser.UserProfile.AvatarUrl
//    );
//};
//
//public record GetPinsPostDTO(
//    int Id,
//    string? Body = null,
//    string? ImageUrl = null,
//    int? Score = null, // TODO: Are these really nullable in the future?
//    int? CommentCount = null,
//    int? UserVote = null
//)
//{
//    public static GetPinsPostDTO FromPin(Pin pin, string? currentUserId) => new(
//        pin.Post.Id,
//        pin.Post.Body,
//        pin.Post.ImageUrl,
//        pin.Post.PostVotes.Sum(v => (int)v.Value),
//        pin.Post.CommentCount,
//        pin.Post.PostVotes
//        .Where(v => v.UserId == currentUserId)
//        .Select(v => (int?)v.Value)
//        .FirstOrDefault()
//    );
//};
//
//public record GetPinsPinDetailsDTO(
//    // Catch pin
//    Species? Species = null,
//    Bait? Bait = null,
//    string? HookSize = null,
//    // Information pin
//    AccessDifficulty? AccessDifficulty = null,
//    Seabed? Seabed = null,
//    // Warning pin
//    WarningKind? WarningKind = null
//){
//    public static GetPinsPinDetailsDTO FromPin(Pin pin) => new(
//        (pin as CatchPin)?.Species,
//        (pin as CatchPin)?.Bait,
//        (pin as CatchPin)?.HookSize,
//        (pin as InfoPin) ?.AccessDifficulty,
//        (pin as InfoPin) ?.Seabed,
//        (pin as WarnPin) ?.WarningKind
//    );
//};
//
//#endregion
