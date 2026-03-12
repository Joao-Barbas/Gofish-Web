using System.ComponentModel.DataAnnotations.Schema;

namespace GofishApi.Models;

public class GroupPost
{
    [ForeignKey(nameof(Post))]
    public int PostId { get; set; }

    [ForeignKey(nameof(Group))]
    public int GroupId { get; set; }

    // Navigation

    public Post Post { get; set; }
    public Group Group { get; set; }
}
