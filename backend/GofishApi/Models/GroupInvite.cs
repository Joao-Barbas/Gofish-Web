using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class GroupInvite
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(Group))]
    public required int GroupId { get; set; }

    [ForeignKey(nameof(Requester))]
    public required string RequesterUserId { get; set; }

    [ForeignKey(nameof(Receiver))]
    public required string ReceiverUserId { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required FriendshipState State { get; set; }

    // Navigation

    public Group Group { get; set; } = null!;
    public AppUser Requester { get; set; } = null!;
    public AppUser Receiver { get; set; } = null!;
}
