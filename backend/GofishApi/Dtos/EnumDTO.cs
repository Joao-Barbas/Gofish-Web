namespace GofishApi.Dtos;

public record EnumDTO(
    string Label,
    int Value
){
    public static IEnumerable<EnumDTO> FromEnum<TEnum>() where TEnum : struct, Enum
    {
        return Enum.GetValues<TEnum>()
                   .Select(e => new EnumDTO(e.ToString(), Convert.ToInt32(e)))
                   .ToList();
    }
};
