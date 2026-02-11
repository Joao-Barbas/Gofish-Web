using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record CreateInfoPinReqDTO (
        double Latitude,
        double Longitude,
        VisibilityType Visibility,
        string? Body,
        string AccessDifficulty,
        SeaBedType SeaBedType
    );
}
