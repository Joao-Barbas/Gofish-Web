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

    [PersonalData]
    [DefaultValue(TwoFactorMethod.None)]
    public TwoFactorMethod TwoFactorMethod { get; set; } = TwoFactorMethod.None;

    // Navigation Properties

    public List<Friendship> RequestedFriendships { get; set; } = [];
    public List<Friendship> ReceivedFriendships { get; set; } = [];

    public List<Group> Groups { get; set; } = [];
    public List<GroupUser> GroupUsers { get; set; } = [];
}
