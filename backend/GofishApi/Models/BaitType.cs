namespace GofishApi.Models
{
    /// <summary>
    /// Use <see cref="Enums.Bait"/> instead.
    /// </summary>
    [Obsolete($"Use {nameof(Enums.Bait)} instead.")]
    public enum BaitType
    {
        Unknown,
        Worm,
        Shrimp,
        Sardine,
        Squid,
        Mussel,
        Crab,
        LiveFish,
        DeadFish
    }
}
