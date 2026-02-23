namespace GofishApi.Models
{
    /// <summary>
    /// Use <see cref="Enums.WarningKind"/> instead.
    /// </summary>
    [Obsolete($"Use {nameof(Enums.WarningKind)} instead.")]
    public enum WarningType
    {
        StrongCurrents,
        AlgaePresence,
        Trash,
        LowVisibility,
        ShallowWater,
        HighWaves,
        DangerousAnimals,
        RestrictedArea,
    }
}
