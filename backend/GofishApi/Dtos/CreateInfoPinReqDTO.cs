using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record CreateInfoPinReqDTO (
        double Latitude,
        double Longitude,
        VisibilityType Visibility,
        string? Body,
        AccessDifficultyType AccessDifficulty,
        SeaBedType SeaBedType
    );
}
