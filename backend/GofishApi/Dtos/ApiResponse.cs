namespace GofishApi.Dtos;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public T? Data { get; set; } = default;
    public IEnumerable<ApiError>? Errors { get; set; } = null;
}

public record ApiError (
    string Code = "", // CamelCase
    string Description = ""
);
