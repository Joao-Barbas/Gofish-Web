using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

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



/*


data?: {
id: number;

geolocation:
    {
    latitude: number;
    longitude: number;
    }
    ;

createdAt: string;
type: number;

author:
    {
    id: number;
    userName: string;
    }
    ;

    post ?: {
        body ?: string;
        imageUrl ?: string;
    }
    ;

    details ?: {
        // Catch Pin
        speciesType ?: number;
        baitType ?: number;
        hookSize ?: number;

        // Info Pin
        accessDifficulty ?: number;
        seaBedType ?: number;

        // Warn Pin
        warningType ?: number;
    }
    ;
}
;
*/