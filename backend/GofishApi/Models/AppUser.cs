using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using UUIDNext;
using GofishApi.Enums;

namespace GofishApi.Models;

public class AppUser : IdentityUser
{
    #region Scalar

    [PersonalData]
    [StringLength(256)]
    public string? FirstName { get; set; }

    [PersonalData]
    [StringLength(256)]
    public string? LastName { get; set; }

    [PersonalData]
    [DefaultValue(TwoFactorMethod.None)]
    public TwoFactorMethod TwoFactorMethod { get; set; } = TwoFactorMethod.None;

    [PersonalData]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    #endregion // Scalar
    #region Navigation

    public UserProfile UserProfile { get; set; } = null!; // Should always exist
    public List<Friendship> RequestedFriendships { get; set; } = [];
    public List<Friendship> ReceivedFriendships { get; set; } = [];
    public List<Vote> Votes { get; set; } = [];
    public List<Group> Groups { get; set; } = [];
    public List<GroupUser> GroupUsers { get; set; } = [];
    public List<Pin> Pins { get; set; } = [];

    #endregion // Navigation
    #region Constructor

    /// <summary>
    /// Initializes a new instance of <see cref="AppUser"/>.
    /// </summary>
    /// <remarks>
    /// The Id property is initialized to form a new UUIDv8 string value. <br/>
    /// See <see cref="Uuid.NewDatabaseFriendly(Database)"/>
    /// </remarks>
    public AppUser()
    {
        Id = Uuid.NewDatabaseFriendly(Database.SqlServer).ToString();
        SecurityStamp = Guid.NewGuid().ToString();
    }

    /// <summary>
    /// Initializes a new instance of <see cref="AppUser"/>.
    /// </summary>
    /// <param name="userName">The user name.</param>
    /// <remarks>
    /// The Id property is initialized to form a new UUIDv8 string value. <br/>
    /// See <see cref="Uuid.NewDatabaseFriendly(Database)"/>
    /// </remarks>
    public AppUser(string userName) : this()
    {
        UserName = userName;
    }

    #endregion // Constructor
}
