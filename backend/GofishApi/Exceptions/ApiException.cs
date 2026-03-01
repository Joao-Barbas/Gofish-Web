using GofishApi.Core;

namespace GofishApi.Exceptions;

/// <summary>
/// Base exception for application-level errors with settable HTTP status codes.
/// Properties are intended to follow machine-readable format for specifying errors in HTTP API responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
public class ApiException : Exception
{
    public IEnumerable<ApiError>? Errors { get; private set; }

    public string? Title { get; private set; }
    public int? Status { get; private set; }
    public string? Detail { get; private set; }

    public ApiException(string? message, string? title, string? detail, int? status, IEnumerable<ApiError>? errors)
        : base(message)
    {
        Errors = errors;
        Title  = title;
        Status = status;
        Detail = detail;
    }

    public ApiException(string? message, string? detail, int? status, IEnumerable<ApiError>? errors)
        : this(message, null, detail, status, errors)
    { }

    public ApiException(string? message, int? status, IEnumerable<ApiError>? errors)
        : this(message, null, null, status, errors)
    { }

    public ApiException(string? message, IEnumerable<ApiError>? errors)
        : this(message, null, null, null, errors)
    { }

    public ApiException(string? message)
        : this(message, null, null, null, null)
    { }

    /// <remarks>
    /// This constructor is required by .NET exception design guidelines
    /// to support proper exception chaining and diagnostic preservation.
    /// </remarks>
    public ApiException(string? message, Exception? innerException)
        : base(message, innerException)
    { }
}
