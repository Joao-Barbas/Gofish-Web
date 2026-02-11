using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class InfoPin : Pin
{
    #region Scalar Properties

    [MaxLength(2)]
    [RegularExpression("^[1-5]$", ErrorMessage = "Value must be between 1 and 5")]
    public required string AccessDifficulty { get; set; }

    public required SeaBedType SeaBedType { get; set; }

    #endregion
}
