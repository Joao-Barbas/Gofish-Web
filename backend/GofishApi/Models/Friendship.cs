using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GofishApi.Enums;

namespace GofishApi.Models;

public class Friendship
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(Requester))]
    public required string RequesterUserId { get; set; }

    [ForeignKey(nameof(Receiver))]
    public required string ReceiverUserId { get; set; }

    public required FriendshipState State { get; set; }

    public required DateTime CreatedAt { get; set; }

    public DateTime? RepliedAt { get; set; }

    // Navigation

    public AppUser Requester { get; set; } = null!;
    public AppUser Receiver { get; set; } = null!;
}
