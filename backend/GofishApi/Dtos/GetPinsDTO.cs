using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record GetPinsReqDTO(
    IReadOnlyCollection<PinIdDTO> Ids,
    PinDataRequestDTO? DataRequest
);

public record GetPinsResDTO(
    IReadOnlyCollection<PinDTO> Pins
);

#region Request

/// <param name="PinId">The unique identifier of a specific pin to retrieve.</param>
/// <param name="AuthorId">The user identifier of the author. Retrieves all pins belonging to this user.</param>
/// <param name="GroupId">The group identified. Retrieves all pins belonging to this group.</param>
public record PinIdDTO(
    int? PinId,
    string? AuthorId,
    int? GroupId
);

public record PinDataRequestDTO(
    bool? IncludeGeolocation = false,
    bool? IncludeAuthor = false,
    bool? IncludePost = false,
    bool? IncludeDetails = false,
    bool? IncludeGroups = false // TODO: List the groups this pins is part of if group visibility
);

#endregion
#region Response

public record PinDTO(
    int Id,
    DateTime CreatedAt,
    VisibilityLevel Visibility,
    PinKind Kind,
    // Optional includes
    PinDetailsDTO? Details,
    GeolocationDTO? Geolocation,
    AuthorDTO? Author,
    PostDTO? Post
    // TODO: GroupDTO? List of group this pin could be part of if group visibility
){
    public static PinDTO FromPin(Pin pin, PinDataRequestDTO? request) => new(
        pin.Id,
        pin.CreatedAt,
        pin.Visibility,
        pin.Kind,
        request?.IncludeDetails ?? false ? PinDetailsDTO.FromPin(pin) : null,
        request?.IncludeGeolocation ?? false ? GeolocationDTO.FromPin(pin) : null,
        request?.IncludeAuthor ?? false && pin.AppUser is not null ? AuthorDTO.FromPin(pin) : null,
        request?.IncludePost ?? false && pin.Post is not null ? PostDTO.FromPin(pin) : null
    );
};

public record GeolocationDTO(
    double Latitude,
    double Longitude
){
    public static GeolocationDTO FromPin(Pin pin) => new(
        pin.Latitude,
        pin.Longitude
    );
};

public record AuthorDTO(
    string Id,
    string UserName
){
    public static AuthorDTO FromPin(Pin pin) => new(
        pin.AppUser.Id,
        pin.AppUser.UserName ?? ""
    );
};

public record PostDTO(
    string? Body = null,
    string? ImageUrl = null,
    int? Score = null, // TODO: Are these really nullable in the future?
    int? CommentCount = null  // ^^^^
){
    public static PostDTO FromPin(Pin pin) => new(
        pin.Post.Body,
        pin.Post.ImageUrl,
        pin.Post.Score,
        pin.Post.Score
    );
};

public record PinDetailsDTO(
    // Catch pin
    Species? Species = null,
    Bait? Bait = null,
    string? HookSize = null,
    // Information pin
    AccessDifficulty? AccessDifficulty = null,
    Seabed? Seabed = null,
    // Warning pin
    WarningKind? WarningKind = null
){
    public static PinDetailsDTO FromPin(Pin pin) => new(
        (pin as CatchPin)?.Species,
        (pin as CatchPin)?.Bait,
        (pin as CatchPin)?.HookSize,
        (pin as InfoPin)?.AccessDifficulty,
        (pin as InfoPin)?.Seabed,
        (pin as WarnPin)?.WarningKind
    );
};

#endregion
