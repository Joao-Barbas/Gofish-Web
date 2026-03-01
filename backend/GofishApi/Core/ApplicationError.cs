namespace GofishApi.Core;

/// <summary>
/// Represents an application-level error.
/// </summary>
public sealed class ApplicationError
{
    /// <summary>
    /// A machine-readable identifier for the error (e.g. "DuplicateUserName").
    /// </summary>
    public string Code { get; set; } = default!;

    /// <summary>
    /// A human-readable explanation of the error.
    /// </summary>
    public string Description { get; set; } = default!;
}
