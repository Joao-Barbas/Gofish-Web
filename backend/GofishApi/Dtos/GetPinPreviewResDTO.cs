using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record GetPinPreviewResDTO(
        // Pin
        int Id,
        double Latitude,
        double Longitude,
        DateTime CreatedAt,
        PinType PinType,

        // User
        Guid AuthorId,
        string AuthorUserName,

        // Post
        string? PostBody         = null,
        string? PostImageUrl     = null,

        // Catch pin
        SpeciesType? SpeciesType = null,
        BaitType? BaitType       = null,
        string? HookSize         = null,

        // Info pin
        string? AccessDifficulty = null,
        SeaBedType? SeaBedType   = null,

        // Warn pin
        WarningType? WarningType = null
    ){
        public static GetPinPreviewResDTO FromCatchPin(CatchPin pin) => new(
            Id:             pin.Id,
            Latitude:       pin.Latitude,
            Longitude:      pin.Longitude,
            CreatedAt:      pin.CreatedAt,
            PinType:        PinType.Catch,
            AuthorId:       pin.UserId,
            AuthorUserName: pin.AppUser.UserName!,
            PostBody:       pin.Post.Body,
            PostImageUrl:   pin.Post.ImageUrl,
            SpeciesType:    pin.SpeciesType,
            BaitType:       pin.BaitType,
            HookSize:       pin.HookSize
        );

        public static GetPinPreviewResDTO FromInfoPin(InfoPin pin) => new(
            Id:               pin.Id,
            Latitude:         pin.Latitude,
            Longitude:        pin.Longitude,
            CreatedAt:        pin.CreatedAt,
            PinType:          PinType.Catch,
            AuthorId:         pin.UserId,
            AuthorUserName:   pin.AppUser.UserName!,
            PostBody:         pin.Post.Body,
            AccessDifficulty: pin.AccessDifficulty,
            SeaBedType:       pin.SeaBedType
        );

        public static GetPinPreviewResDTO FromWarnPin(WarnPin pin) => new(
            Id:             pin.Id,
            Latitude:       pin.Latitude,
            Longitude:      pin.Longitude,
            CreatedAt:      pin.CreatedAt,
            PinType:        PinType.Catch,
            AuthorId:       pin.UserId,
            AuthorUserName: pin.AppUser.UserName!,
            WarningType:    pin.WarningType
        );
    }
}