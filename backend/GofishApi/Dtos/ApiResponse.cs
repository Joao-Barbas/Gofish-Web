namespace GofishApi.Dtos
{
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

    /*
     * To Angular:
     * 
     * export interface T { <-- T = Concrete DTO record (ex: CreateCatchPinReqDTO)
     *   success: boolean;
     *   data?: {
     *     attribute1: number;
     *     attribute2: string;
     *     ...
     *   }
     *   errors?: {
     *     code: string;
     *     description: string;
     *   }[]
     * }
     */
}
