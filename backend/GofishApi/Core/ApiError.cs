namespace GofishApi.Core;

/// <summary>
/// Represents a structured application-level error.
/// </summary>
/// <param name="Code">
/// A machine-readable identifier for the error (e.g. "DuplicateUserName").
/// </param>
/// <param name="Description">
/// A human-readable explanation of the error.
/// </param>
public sealed record ApiError(
    string Code, // CamelCase
    string Description
);
