using GofishApi.Core;

namespace GofishApi.Exceptions;

/// <summary>
/// Base exception for application-level errors with settable HTTP status codes.
/// Properties are intended to follow machine-readable format
/// for specifying errors in HTTP API responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
public class ApplicationOperationException : Exception
{
    public IEnumerable<ApplicationError>? Errors { get; private set; }

    public string? Title { get; private set; }
    public int? Status { get; private set; }
    public string? Detail { get; private set; }

    public ApplicationOperationException(string? message, string? title, string? detail, int? status, IEnumerable<ApplicationError>? errors)
        : base(message)
    {
        Errors = errors;
        Title  = title;
        Status = status;
        Detail = detail;
    }

    public ApplicationOperationException(string? message, string? detail, int? status, IEnumerable<ApplicationError>? errors)
        : this(message, null, detail, status, errors)
    { }

    public ApplicationOperationException(string? message, int? status, IEnumerable<ApplicationError>? errors)
        : this(message, null, null, status, errors)
    { }

    public ApplicationOperationException(string? message, int? status)
        : this(message, null, null, status, null)
    { }

    /// <remarks>
    /// This constructor is required by .NET exception design guidelines
    /// to support proper exception chaining and diagnostic preservation.
    /// </remarks>
    public ApplicationOperationException(string? message, Exception? innerException)
        : base(message, innerException)
    { }

    public ApplicationOperationException(string? message)
        : base(message)
    { }
}
