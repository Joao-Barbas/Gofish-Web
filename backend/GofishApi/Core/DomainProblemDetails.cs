using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GofishApi.Core;

/// <summary>
/// A machine-readable format for specifying errors in HTTP API
/// responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
/// <remarks>
/// Extends <see cref="ProblemDetails"/> to support returning multiple errors at once,
/// following the same convention/way as <see cref="IdentityResult"/> but
/// with the shape similar of <see cref="ValidationProblemDetails.Errors"/>.
/// </remarks>
public sealed class DomainProblemDetails : ProblemDetails
{
    /// <summary>
    /// Application-level errors as key-value pairs.
    /// Keys are machine-readable error codes; values are human-readable descriptions.
    /// </summary>
    /// <remarks>
    /// Mirrors the shape of <see cref="ValidationProblemDetails.Errors"/> but with single-string values
    /// instead of string arrays, allowing clients to distinguish between validation errors and application errors.
    /// </remarks>
    [JsonPropertyName("errors")]
    public IDictionary<string, string>? Errors { get; set; }

    /// <summary>
    /// Creates an instance from an existing ProblemDetails.
    /// Copies all standard ProblemDetails properties except <see cref="ProblemDetails.Extensions"/>.
    /// </summary>
    /// <param name="problemDetails">
    /// The ProblemDetails to copy from.
    /// </param>
    public DomainProblemDetails(ProblemDetails problemDetails, IDictionary<string, string>? errors)
    {
        ArgumentNullException.ThrowIfNull(problemDetails);

        Status   = problemDetails.Status;
        Title    = problemDetails.Title;
        Type     = problemDetails.Type;
        Detail   = problemDetails.Detail;
        Instance = problemDetails.Instance;

        Errors   = errors;

        // We do not copy extensions dictionary for now
        // Not needed
    }

    public DomainProblemDetails(ProblemDetails problemDetails)
        : this(problemDetails, null)
    { }

    /// <summary>
    /// Default constructor.
    /// </summary>
    public DomainProblemDetails() { }
}
