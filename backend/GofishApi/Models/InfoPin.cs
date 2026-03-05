using GofishApi.Enums;

namespace GofishApi.Models;

public class InfoPin : Pin
{
    #region Scalar Properties

    public required AccessDifficulty AccessDifficulty { get; set; }
    public required Seabed Seabed { get; set; }

    #endregion
}
