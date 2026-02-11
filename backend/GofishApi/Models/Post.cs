using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models
{
    public class Post
    {
        #region Scalar Properties

        [Key]
        public int Id { get; set; }

        [MaxLength(2000)]
        public string? Body { get; set; }

        [Url]
        [MaxLength(2000)]
        public string? ImageUrl { get; set; }

        public required DateTime CreatedAt { get; set; }
        public int UpVotes { get; set; } = 0;
        public int DownVotes { get; set; } = 0;
        public int PinId { get; set; }
        public Guid UserId { get; set; }

        #endregion
        #region Navigation Properties

        public Pin Pin { get; set; } = null!;
        public AppUser AppUser { get; set; } = null!;
        // public /* virtual // Maybe? */ ICollection<Comment> Comments { get; set; } = new(); // TODO

        #endregion
    }
}
