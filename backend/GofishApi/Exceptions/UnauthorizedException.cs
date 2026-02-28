using Microsoft.AspNetCore.Identity;
using GofishApi.Core;

namespace GofishApi.Exceptions;

public class UnauthorizedException : ApiException
{
    public UnauthorizedException(IEnumerable<ApiError>? errors)
        : base("Authorization failed", StatusCodes.Status400BadRequest, errors)
    { }

    public UnauthorizedException(string? message, IEnumerable<ApiError>? errors)
        : base(message, StatusCodes.Status401Unauthorized, errors)
    { }
}
