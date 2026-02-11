using GofishApi.Models;

namespace GofishApi.Dtos
{
    public record GetViewportPinsResDTO (
        IEnumerable<ViewportPinDTO> Pins
    );

    public record ViewportPinDTO (
        int Id,
        double Latitude,
        double Longitude,
        DateTime CreatedAt,
        PinType PinType
    );
}
