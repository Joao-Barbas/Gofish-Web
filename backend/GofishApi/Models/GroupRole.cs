using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models;

public class GroupRole
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [MaxLength(100)]
    public required string Name { get; set; }
    
    [MaxLength(100)]
    public required string NormalizedName { get; set; }
}
