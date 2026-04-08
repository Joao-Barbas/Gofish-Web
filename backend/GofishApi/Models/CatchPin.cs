using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;

namespace GofishApi.Models;

public class CatchPin : Pin
{
    public const int ExpiresInDays = 30;

    // Scalar properties

    [MaxLength(5)]
    public string? HookSize { get; set; } // European standard

    public Species? Species { get; set; }

    public Bait? Bait { get; set; }
}
