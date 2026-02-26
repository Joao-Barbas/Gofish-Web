using GofishApi.Enums;

namespace GofishApi.Dtos;

public record ViewportPinsReqDTO(
    // Unused
    // Endpoint uses query
);

public record ViewportPinsResDTO(
    IEnumerable<ViewportPinDTO> Pins
);

public record ViewportPinDTO(
    int Id,
    double Latitude,
    double Longitude,
    DateTime CreatedAt,
    VisibilityLevel VisibilityLevel,
    PinKind Kind
);
