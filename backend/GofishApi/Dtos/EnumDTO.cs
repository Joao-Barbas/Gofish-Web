using GofishApi.Extensions;

namespace GofishApi.Dtos;

public record EnumDTO(
    string Label,
    string? Display,
    int Value
){
    public static IEnumerable<EnumDTO> FromEnum<TEnum>() where TEnum : struct, Enum
    {
        return Enum.GetValues<TEnum>()
            .Select(e => new EnumDTO(
                e.ToString(),
                e.ToDisplayName(),
                e.ToValue()))
            .ToList();
    }
};
