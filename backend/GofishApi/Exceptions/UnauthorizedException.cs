using GofishApi.Core;

namespace GofishApi.Exceptions;

public sealed class UnauthorizedException : ApiException
{
    public UnauthorizedException()
        : this(null)
    { }

    public UnauthorizedException(IEnumerable<ApiError>? errors)
        : this("Authentication failed", errors)
    { }

    public UnauthorizedException(string? message, IEnumerable<ApiError>? errors)
        : base(message, StatusCodes.Status401Unauthorized, errors)
    { }
}
