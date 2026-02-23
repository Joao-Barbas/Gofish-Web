namespace GofishApi.Models
{
    /// <summary>
    /// Use <see cref="Enums.VisibilityLevel"/> instead.
    /// </summary>
    [Obsolete($"Use {nameof(Enums.VisibilityLevel)} instead.")]
    public enum VisibilityType
    {
        Public,
        Group,
        Private
    }
}
