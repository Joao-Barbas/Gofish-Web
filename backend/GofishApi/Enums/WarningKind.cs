using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum WarningKind
{
    [Display(Name="Strong currents")]   StrongCurrents   = 0,
    [Display(Name="Algae presence")]    AlgaePresence    = 1,
    [Display(Name="Trash")]             Trash            = 2,
    [Display(Name="Low visibility")]    LowVisibility    = 3,
    [Display(Name="Shallow water")]     ShallowWater     = 4,
    [Display(Name="High waves")]        HighWaves        = 5,
    [Display(Name="Dangerous animals")] DangerousAnimals = 6,
    [Display(Name="Restricted area")]   RestrictedArea   = 7
}
