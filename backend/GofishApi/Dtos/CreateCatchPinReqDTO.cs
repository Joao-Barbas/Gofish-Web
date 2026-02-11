using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record CreateCatchPinReqDTO (
        double Latitude,
        double Longitude,
        VisibilityType Visibility,
        string? Body,
        IFormFile Image,
        SpeciesType? SpeciesType,
        string? HookSize,
        BaitType? BaitType
    );
}
