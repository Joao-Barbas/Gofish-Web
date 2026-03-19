using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum VisibilityLevel
{
    [Display(Name="Public")]  Public  = 0,
    [Display(Name="Friends")] Friends = 1,
    [Display(Name="Group")]   Group   = 2,
    [Display(Name="Private")] Private = 3
}
