using GofishApi.Core;

namespace GofishApi.Exceptions;

public sealed class UnauthorizedException : ApplicationException
{
    public UnauthorizedException(string? message, IEnumerable<ApiError>? errors)
        : base(message, StatusCodes.Status401Unauthorized, errors)
    { }

    public UnauthorizedException(IEnumerable<ApiError>? errors)
        : this("Authentication is required to perform this action", errors)
    { }

    public UnauthorizedException()
        : this(null)
    { }
}
