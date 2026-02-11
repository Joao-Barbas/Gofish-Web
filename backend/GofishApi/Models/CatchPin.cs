using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class CatchPin : Pin
{
    #region Constant Properties

    public const int ExpiresInDays = 7;

    #endregion
    #region Scalar Properties

    [MaxLength(5)]
    public string? HookSize { get; set; } // European standard

    public SpeciesType? SpeciesType { get; set; }
    public BaitType? BaitType { get; set; }

    #endregion
}
