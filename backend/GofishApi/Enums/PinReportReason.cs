using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum PinReportReason 
{
    [Display(Name="Offensive Content")]   OffensiveContent   = 0,
    [Display(Name="Spam")]                Spam               = 1,
    [Display(Name="Wrong Location")]      WrongLocation      = 2,
    [Display(Name="MisLeading Info")]     MisleadingInfo     = 3,
    [Display(Name="Inappropriate Image")] InappropriateImage = 4,
    [Display(Name="Fake Catch")]          FakeCatch          = 5,
    [Display(Name="Illegal Activity")]    IllegalActivity    = 6,
    [Display(Name="Duplicate Pin")]       DuplicatePin       = 7,
    [Display(Name="Private Location")]    PrivateLocation    = 8,
    [Display(Name="Other")]               Other              = 9
}
