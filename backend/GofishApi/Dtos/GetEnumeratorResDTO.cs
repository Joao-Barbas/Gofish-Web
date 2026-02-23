namespace GofishApi.Dtos;

/// <summary>
/// Use <see cref="Dtos.GetEnumDTO"/> instead.
/// </summary>
[Obsolete($"Use {nameof(EnumDTO)} instead")]
public record GetEnumeratorResDTO(
    IEnumerable<EnumeratorDTO> Enumerator
){
    public static GetEnumeratorResDTO FromEnum<TEnum>() where TEnum : struct, Enum
    {
        return new GetEnumeratorResDTO(
            Enum.GetValues<TEnum>()
            .Select(e => new EnumeratorDTO(e.ToString(), Convert.ToInt32(e)))
            .ToList()
        );
    }
};

/// <summary>
/// Use <see cref="Dtos.GetEnumDTO"/> instead.
/// </summary>
[Obsolete($"Use {nameof(EnumDTO)} instead")]
public record EnumeratorDTO(
    string Name,
    int Value
);
