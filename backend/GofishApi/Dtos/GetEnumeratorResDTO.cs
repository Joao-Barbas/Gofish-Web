using GofishApi.Models;

namespace GofishApi.Dtos;

public record GetEnumeratorResDTO(
    IEnumerable<EnumeratorDTO> Enumerator
){
    public static GetEnumeratorResDTO FromEnum<TEnum>() where TEnum : struct, Enum
    {
        return new GetEnumeratorResDTO(
            Enum.GetValues<TEnum>()
            .Select(e => new EnumeratorDTO(Convert.ToInt32(e),e.ToString()))
            .ToList()
        );
    }
};

public record EnumeratorDTO(
    int Value, 
    string Name
);




