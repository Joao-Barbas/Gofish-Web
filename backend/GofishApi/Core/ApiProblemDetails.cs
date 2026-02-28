using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GofishApi.Core;

/// <summary>
/// A machine-readable format for specifying errors in HTTP API responses based on <see href="https://tools.ietf.org/html/rfc7807"/>.
/// </summary>
/// <remarks>
/// Extends <see cref="ProblemDetails"/> to support returning multiple errors at once,
/// following the same convention/way as <see cref="IdentityResult"/>.
/// </remarks>
public sealed class ApiProblemDetails : ProblemDetails
{
    /// <summary>
    /// Application-level errors.
    /// Each with a machine-readable <c>Code</c> and human-readable <c>Description</c>.
    /// </summary>
    [JsonPropertyName("errors")]
    public IEnumerable<ApiError>? Errors { get; set; }

    /// <summary>
    /// Creates an instance from an existing ProblemDetails.
    /// Copies all standard ProblemDetails properties except <see cref="ProblemDetails.Extensions"/>.
    /// </summary>
    /// <param name="pd">
    /// The ProblemDetails to copy from.
    /// </param>
    public ApiProblemDetails(ProblemDetails problemDetails, IEnumerable<ApiError>? errors)
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

    public ApiProblemDetails(ProblemDetails problemDetails)
        : this(problemDetails, null)
    { } 

    /// <summary>
    /// Default constructor.
    /// </summary>
    public ApiProblemDetails() { }
}
