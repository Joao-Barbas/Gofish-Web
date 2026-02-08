namespace GofishApi.Dtos
{
    public class ApiErrorResponse : ApiResponse<object>
    {
        public new bool Success { get; set; } = false;
        public new object? Data { get; set; } = null;
    }
}
