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
public class ApiProblemDetails : ProblemDetails
{
    /// <summary>
    /// Application-level errors.
    /// Each with a machine-readable <c>Code</c> and human-readable <c>Description</c>.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    [JsonPropertyName("errors")]
    public IEnumerable<ApiError>? Errors { get; set; }
}
