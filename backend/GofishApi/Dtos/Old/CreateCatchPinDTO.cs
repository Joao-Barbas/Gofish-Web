using GofishApi.Enums;

namespace GofishApi.Dtos;

public record CreateCatchPinReqDTO(
    double Latitude,
    double Longitude,
    IEnumerable<int>? GroupIds,
    string? Body,
    IFormFile Image,
    VisibilityLevel Visibility,
    Species? Species,
    Bait? Bait,
    string? HookSize
);

public record CreateCatchPinResDTO(
    int Id
);

