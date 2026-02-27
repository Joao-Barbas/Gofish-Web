using GofishApi.Enums;

namespace GofishApi.Dtos;

public record CreateWarnPinReqDTO(
    double Latitude,
    double Longitude,
    string? Body,
    VisibilityLevel Visibility,
    WarningKind WarningKind
);


public record CreateWarnPinResDTO(
    int Id
);
