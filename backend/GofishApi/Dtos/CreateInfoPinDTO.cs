using GofishApi.Enums;

namespace GofishApi.Dtos;

public record CreateInfoPinReqDTO(
    double Latitude,
    double Longitude,
    string? Body,
    VisibilityLevel VisibilityLevel,
    AccessDifficulty AccessDifficulty,
    Seabed Seabed
);

public record CreateInfoPinResDTO(
    int Id
);
