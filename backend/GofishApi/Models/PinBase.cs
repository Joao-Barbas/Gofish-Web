
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models
{
    public abstract class PinBase : IPin
    {
        [Key]
        public int Id { get; set; } = default!;
        public int Latitude { get; set; }
        public int Longitude { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public PinType PinType { get; set; }
    }
}
