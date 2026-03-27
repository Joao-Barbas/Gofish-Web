using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum Bait
{
    [Display(Name="Unknown")]   Unknown  = 0,
    [Display(Name="Worm")]      Worm     = 1,
    [Display(Name="Shrimp")]    Shrimp   = 2,
    [Display(Name="Sardine")]   Sardine  = 3,
    [Display(Name="Squid")]     Squid    = 4,
    [Display(Name="Mussel")]    Mussel   = 5,
    [Display(Name="Crab")]      Crab     = 6,
    [Display(Name="Live fish")] LiveFish = 7,
    [Display(Name="Dead fish")] DeadFish = 8
}
