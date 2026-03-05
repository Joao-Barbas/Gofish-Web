using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;

namespace GofishApi.Models;

public class CatchPin : Pin
{
    #region Constant Properties

    public const int ExpiresInDays = 7;

    #endregion
    #region Scalar Properties

    [MaxLength(5)]
    public string? HookSize { get; set; } // European standard

    public Species? Species { get; set; }
    public Bait? Bait { get; set; }

    #endregion
}
