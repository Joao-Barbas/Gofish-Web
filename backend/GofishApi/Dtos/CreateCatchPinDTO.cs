using GofishApi.Enums;

namespace GofishApi.Dtos;

public record CreateCatchPinReqDTO(
    double Latitude,
    double Longitude,
    string? Body,
    IFormFile Image,
    VisibilityLevel VisibilityLevel,
    Species? Species,
    Bait? Bait,
    string? HookSize
);

public record CreateCatchPinResDTO(
    int Id
);

