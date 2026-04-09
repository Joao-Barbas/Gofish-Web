using GofishApi.Enums;

namespace GofishApi.Models;

public class WarnPin : Pin
{
    public const int ExpiresInDays = 3;

    // Scalar properties

    public required WarningKind WarningKind { get; set; }
}
