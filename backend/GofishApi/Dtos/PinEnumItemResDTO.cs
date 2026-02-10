namespace GofishApi.Dtos;

public record PinEnumItemResDTO(int Id, string Name);

public class PinEnumsResDTO
{
    public IEnumerable<PinEnumItemResDTO> SeaBedTypes { get; init; } = [];
    public IEnumerable<PinEnumItemResDTO> SpeciesTypes { get; init; } = [];
    public IEnumerable<PinEnumItemResDTO> BaitTypes { get; init; } = [];
    public IEnumerable<PinEnumItemResDTO> WarnPinTypes { get; init; } = [];
}
