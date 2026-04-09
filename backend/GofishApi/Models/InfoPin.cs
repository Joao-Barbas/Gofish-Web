using GofishApi.Enums;

namespace GofishApi.Models;

public class InfoPin : Pin
{
    public const int ExpiresInDays = 60;
    
    // Scalar properties

    public required AccessDifficulty AccessDifficulty { get; set; }

    public required Seabed Seabed { get; set; }

}
