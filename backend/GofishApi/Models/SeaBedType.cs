namespace GofishApi.Models
{
    /// <summary>
    /// Use <see cref="Enums.Seabed"/> instead.
    /// </summary>
    [Obsolete($"Use {nameof(Enums.Seabed)} instead.")]
    public enum SeaBedType
    {
        Sandy,
        Coral,
        Muddy,
        Rocky,
        Stony,
        Vegetal,
        Mixed,
        Clay
    }
}
