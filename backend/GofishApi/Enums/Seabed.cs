using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum Seabed
{
    [Display(Name="Unknown")]    Unknown    = 0,
    [Display(Name="Sand")]       Sand       = 1,
    [Display(Name="Mud")]        Mud        = 2,
    [Display(Name="Clay")]       Clay       = 3,
    [Display(Name="Rock")]       Rock       = 4,
    [Display(Name="Gravel")]     Gravel     = 5,
    [Display(Name="Coral")]      Coral      = 6,
    [Display(Name="Seagrass")]   Seagrass   = 7,
    [Display(Name="Rubble")]     Rubble     = 8,
    [Display(Name="Kelp")]       Kelp       = 9,
    [Display(Name="Shell")]      Shell      = 10,
    [Display(Name="Artificial")] Artificial = 11,
    [Display(Name="Mixed")]      Mixed      = 12
}
