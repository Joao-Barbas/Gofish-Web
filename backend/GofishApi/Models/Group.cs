using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class Group
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    [MaxLength(100)]
    public string NormalizedName { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; }

    [Url]
    [MaxLength(500)]
    public string AvatarUrl { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

}
