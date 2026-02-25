using GofishApi.Enums;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class AppUser : IdentityUser
{
    [PersonalData]
    [StringLength(256)]
    public string? FirstName { get; set; }

    [PersonalData]
    [StringLength(256)]
    public string? LastName { get; set; }

    [DefaultValue(TwoFactorMethod.None)]
    public TwoFactorMethod TwoFactorMethod { get; set; } = TwoFactorMethod.None;
}
