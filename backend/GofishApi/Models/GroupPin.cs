using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class GroupPin
{
    // This one can stay with composite keys
    // because we just used as a simple
    // many-to-many without state of its own

    [ForeignKey(nameof(Pin))]
    public int PinId { get; set; }

    [ForeignKey(nameof(Group))]
    public int GroupId { get; set; }

    // Navigation

    public Pin Pin { get; set; } = null!;
    public Group Group { get; set; } = null!;
}
