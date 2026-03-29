using GofishApi.Extensions;

namespace GofishApi.Dtos;

#region View Models

public record EnumDTO(
    string Label,
    string? Display,
    int Value
)
{
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

#endregion // View Models
#region Requests



#endregion // Requests
#region Responses



#endregion // Responses

