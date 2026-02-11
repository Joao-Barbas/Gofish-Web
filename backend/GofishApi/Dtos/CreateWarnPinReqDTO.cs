using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record CreateWarnPinReqDTO (
        double Latitude,
        double Longitude,
        VisibilityType Visibility,
        string? Body,
        WarningType WarningType
    );
}
