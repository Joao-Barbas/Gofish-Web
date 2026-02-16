namespace GofishApi.Dtos
{
    public record GetPinPreviewsResDTO(
        IEnumerable<GetPinPreviewResDTO> Pins
    );
}
