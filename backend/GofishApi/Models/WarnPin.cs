namespace GofishApi.Models;

public class WarnPin : Pin
{
    #region Constant Properties

    public const int ExpiresInDays = 1;

    #endregion
    #region Scalar Properties

    public required WarningType WarningType;

    #endregion
}
