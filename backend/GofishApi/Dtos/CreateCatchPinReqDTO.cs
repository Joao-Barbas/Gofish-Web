using GofishApi.Models;

namespace GofishApi.Dtos
{
    // TODO: So o utilizador logado com este
    // Guid consegue chamar metodos com este DTO
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
