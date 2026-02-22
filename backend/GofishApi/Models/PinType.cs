namespace GofishApi.Models
{
    /// <summary>
    /// Use <see cref="Enums.PinKind"/> instead.
    /// </summary>
    [Obsolete($"Use {nameof(Enums.PinKind)} instead.")]
    public enum PinType
    {
        Catch = 0,
        Info = 1,
        Warning = 2,
    }
}
