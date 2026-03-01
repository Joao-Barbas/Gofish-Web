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
public sealed class ApplicationProblemDetails : ProblemDetails
{
    /// <summary>
    /// Application-level errors,
    /// each with a machine-readable <c>Code</c>
    /// and human-readable <c>Description</c>.
    /// </summary>
    [JsonPropertyName("errors")]
    public IEnumerable<ApplicationError>? Errors { get; set; }

    /// <summary>
    /// Creates an instance from an existing <see cref="ProblemDetails"/>.
    /// Copies all standard properties except <see cref="ProblemDetails.Extensions"/>.
    /// </summary>
    /// <param name="problemDetails">
    /// The ProblemDetails to copy values from.
    /// </param>
    public ApplicationProblemDetails(ProblemDetails problemDetails, IEnumerable<ApplicationError>? errors)
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

    /* public ApplicationProblemDetails(ProblemDetails problemDetails)
        : this(problemDetails, null)
    { } */

    /// <summary>
    /// Default constructor.
    /// </summary>
    public ApplicationProblemDetails() { }
}
