using System.ComponentModel.DataAnnotations;

namespace GofishApi.Enums;

public enum GroupRole
{
    [Display(Name="Member")]     Member    = 0,
    [Display(Name="Moderator")] Moderator = 1,
    [Display(Name="Owner")]      Owner     = 2
}

/*
 
        new GroupRole
        {
            Id = "1",
            Name = "Owner",
            NormalizedName = "OWNER"
        },
        new GroupRole
        {
            Id = "2",
            Name = "Admin",
            NormalizedName = "ADMIN"
        },
        new GroupRole
        {
            Id = "3",
            Name = "Member",
            NormalizedName = "MEMBER"
        }

 */
