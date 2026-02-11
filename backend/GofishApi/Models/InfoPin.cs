using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class InfoPin : Pin
{
    #region Scalar Properties

    public required AccessDifficultyType AccessDifficulty { get; set; }
    public required SeaBedType SeaBedType { get; set; }

    #endregion
}
