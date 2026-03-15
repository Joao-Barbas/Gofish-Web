namespace GofishApi.Exceptions;

/// <summary>
/// Base exception for application-level errors with settable HTTP status codes.
/// This is intended to follow the machine-readable format for specifying errors in HTTP API responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
public class AppException : Exception
{
    public string? Title { get; protected set; }
    public int? Status { get; protected set; }
    public string? Detail { get; protected set; }

    public AppException(
        string? title = null,
        int? status = null,
        string? detail = null,
        string? message = null
    ) : base(message ?? detail ?? "An unexpected error on the server has occurred")
    {
        Status = status ?? StatusCodes.Status500InternalServerError;
        Title = title ?? "Internal server error";
        Detail = detail ?? "An unexpected error on the server has occurred";
    }

    #region Obsolete

    [Obsolete("Use AppException(string? title, int? status, string? detail, string? message) instead.")]
    public AppException(string? message, string? title, string? detail, int? status)
        : base(message)
    {
        Title  = title;
        Status = status;
        Detail = detail;
    }

    [Obsolete("Use AppException(string? title, int? status, string? detail, string? message) instead.")]
    public AppException(string? message, string? detail, int? status)
        : this(message, null, detail, status)
    { }

    [Obsolete("Use AppException(string? title, int? status, string? detail, string? message) instead.")]
    public AppException(string? message, int? status)
        : this(message, null, null, status)
    { }

    #endregion // Obsolete

    /// <remarks>
    /// This constructor is required by .NET exception design guidelines
    /// to support proper exception chaining and diagnostic preservation.
    /// </remarks>
    public AppException(string? message, Exception? innerException)
        : base(message, innerException)
    { }

    public AppException(string? message)
        : base(message)
    { }
}

/*

NotFoundException (404) — resource not found
ConflictException (409) — duplicate or state conflict
ValidationException (400) — input validation failures
BadRequestException (400) — general malformed request
UnauthorizedException (401) — missing or invalid authentication
ForbiddenException (403) — authenticated but insufficient permissions
UnprocessableEntityException (422) — semantically invalid request
TooManyRequestsException (429) — rate limiting
GoneException (410) — resource permanently removed
PayloadTooLargeException (413) — request body exceeds limit
ExternalServiceException (502) — downstream API or service failure
ServiceUnavailableException (503) — temporary unavailability
BusinessRuleViolationException (409 or 422) — domain invariant broken
ConcurrencyException (409) — optimistic concurrency conflict
TimeoutException (504) — operation timed out

*/
