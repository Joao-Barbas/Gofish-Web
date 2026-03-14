using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class GroupUser
{
    public DateTime JoinedAt { get; set; }

    [ForeignKey(nameof(AppUser))]
    public required string UserId { get; set; }

    [ForeignKey(nameof(Group))]
    public required int GroupId { get; set; }

    [ForeignKey(nameof(Role))]
    public required string RoleId { get; set; }

    // Navigation

    public AppUser AppUser { get; set; }
    public Group Group { get; set; }
    public GroupRole Role { get; set; }

}
