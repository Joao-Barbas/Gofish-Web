using GofishApi.Core;

namespace GofishApi.Exceptions;

/// <summary>
/// Base exception for application-level errors with settable HTTP status codes.
/// Properties are intended to follow machine-readable format for specifying errors in HTTP API responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
public class DomainException : Exception
{
    public IDictionary<string, string>? Errors { get; private set; }

    public string? Title { get; private set; }
    public int? Status { get; private set; }
    public string? Detail { get; private set; }

    public DomainException(string? message, string? title, string? detail, int? status, Dictionary<string, string>? errors)
        : base(message)
    {
        Errors = errors;
        Title  = title;
        Status = status;
        Detail = detail;
    }

    public DomainException(string? message, string? detail, int? status, Dictionary<string, string>? errors)
        : this(message, null, detail, status, errors)
    { }

    public DomainException(string? message, int? status, Dictionary<string, string>? errors)
        : this(message, null, null, status, errors)
    { }

    public DomainException(string? message, int? status)
        : this(message, null, null, status, null)
    { }

    public DomainException(string? message)
        : base(message)
    { }

    /// <remarks>
    /// This constructor is required by .NET exception design guidelines
    /// to support proper exception chaining and diagnostic preservation.
    /// </remarks>
    public DomainException(string? message, Exception? innerException)
        : base(message, innerException)
    { }
}
