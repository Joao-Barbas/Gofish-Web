using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum AccessDifficulty
{
    [Display(Name="Very low")]  Lower   = 0,
    [Display(Name="Low")]       Low     = 1,
    [Display(Name="Medium")]    Medium  = 2,
    [Display(Name="High")]      High    = 3,
    [Display(Name="Very high")] Highest = 4
}
