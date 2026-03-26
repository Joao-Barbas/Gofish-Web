using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum Species
{
    [Display(Name="Unknown")]   Unknown   = 0,
    [Display(Name="Achiga")]    Achiga    = 1,
    [Display(Name="Carp")]      Carp      = 2,
    [Display(Name="Catfish")]   Catfish   = 3,
    [Display(Name="Pike")]      Pike      = 4,
    [Display(Name="Perch")]     Perch     = 5,
    [Display(Name="Trout")]     Trout     = 6,
    [Display(Name="Salmon")]    Salmon    = 7,
    [Display(Name="Tilapia")]   Tilapia   = 8,
    [Display(Name="Tuna")]      Tuna      = 9,
    [Display(Name="Cod")]       Cod       = 10,
    [Display(Name="Mackerel")]  Mackerel  = 11,
    [Display(Name="Sardine")]   Sardine   = 12,
    [Display(Name="Anchovy")]   Anchovy   = 13,
    [Display(Name="Snook")]     Snook     = 14,
    [Display(Name="Grouper")]   Grouper   = 15,
    [Display(Name="Swordfish")] Swordfish = 16,
    [Display(Name="Flounder")]  Flounder  = 17,
    [Display(Name="Herring")]   Herring   = 18,
    [Display(Name="Shark")]     Shark     = 19,
    [Display(Name="Ray")]       Ray       = 20,
    [Display(Name="Eel")]       Eel       = 21
}

