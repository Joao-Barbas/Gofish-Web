namespace GofishApi.Dtos;

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

public record EnumeratorDTO(
    string Name,
    int Value
);
