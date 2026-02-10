using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record GetPinPreviewResDTO(
        int Id,
        double Latitude,
        double Longitude,
        DateTime CreatedAt,
        PinType PinType,
        string Description = "",

        // Catch pin
        string? ImageUrl = null,
        SpeciesType? SpeciesType = null,
        int? HookSize = null,
        BaitType? BaitType = null,

        // Info pin
        int? AccessDifficulty = null,
        SeaBedType? SeaBedType = null,

        // Warn pin
        WarningType? WarnPinType = null
    )
    {
        public static GetPinPreviewResDTO FromCatchPin(CatchPin pin) => new(
            Id: pin.Id,
            Latitude: pin.Latitude,
            Longitude: pin.Longitude,
            CreatedAt: pin.CreatedAt,
            PinType: PinType.Catch,
            Description: pin.Description ?? "",
            ImageUrl: pin.ImageUrl,
            SpeciesType: pin.SpeciesType,
            HookSize: pin.HookSize,
            BaitType: pin.BaitType
        );

        public static GetPinPreviewResDTO FromInfoPin(InfoPin pin) => new(
            Id: pin.Id,
            Latitude: pin.Latitude,
            Longitude: pin.Longitude,
            CreatedAt: pin.CreatedAt,
            PinType: PinType.Info,
            Description: pin.Description ?? "",
            AccessDifficulty: pin.AccessDifficulty,
            SeaBedType: pin.SeaBedType
        );

        public static GetPinPreviewResDTO FromWarnPin(WarnPin pin) => new(
            Id: pin.Id,
            Latitude: pin.Latitude,
            Longitude: pin.Longitude,
            CreatedAt: pin.CreatedAt,
            PinType: PinType.Warning,
            Description: pin.Description ?? "",
            WarnPinType: pin.WarnPinType
        );
    }
}