using GofishApi.Enums;

namespace GofishApi.Dtos;

public record CreateWarnPinReqDTO(
    double Latitude,
    double Longitude,
    string? Body,
    VisibilityLevel VisibilityLevel,
    WarningKind WarningKind
);


public record CreateWarnPinResDTO(
    int Id
);
