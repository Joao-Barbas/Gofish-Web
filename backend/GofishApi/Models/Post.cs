using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(2000)]
        public string? Body { get; set; }

        [Url]
        [MaxLength(2000)]
        public string? ImageUrl { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public required DateTime CreatedAt { get; set; }

        // public ICollection<Comment> Comments { get; set; } = new(); // TODO

        public int UpVotes { get; set; }
        public int DownVotes { get; set; }

        [ForeignKey("Pin")]
        public int PinId { get; set; }
        public Pin Pin { get; set; } = null!;

        [ForeignKey("AppUser")]
        public Guid UserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
    }
}
