namespace GofishApi.Models;

/// <summary>
/// Use <see cref="Enums.AccessDifficulty"/> instead.
/// </summary>
[Obsolete($"Use {nameof(Enums.AccessDifficulty)} instead.")]
public enum AccessDifficultyType
{
    Lower,
    Low,
    Medium,
    High,
    Highest
}
