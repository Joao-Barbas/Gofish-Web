using GofishApi.Core;

namespace GofishApi.Exceptions;

/// <summary>
/// Base exception for application-level errors with custom HTTP status codes.
/// Properties are intended to follow machine-readable format for specifying errors in HTTP API responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
public class ApiException : Exception
{
    public int? Status { get; set; }
    public IEnumerable<ApiError>? Errors { get; set; }

    public ApiException(string? message, int? status, IEnumerable<ApiError>? errors)
        : base(message)
    {
        Status  = status;
        Errors  = errors;
    }

    public ApiException(string? message, IEnumerable<ApiError>? errors)
        : this(message, null, errors)
    { }

    public ApiException(IEnumerable<ApiError>? errors)
        : this(null, null, errors)
    { }

    public ApiException(string? message)
        : this(message, null, null)
    { }
}
