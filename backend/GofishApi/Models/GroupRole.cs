using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class GroupRole
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    [MaxLength(100)]
    public string NormalizedName { get; set; }
}
