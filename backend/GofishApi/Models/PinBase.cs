
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models
{
    public abstract class PinBase
    {
        [Key]
        public int Id { get; set; } = default!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public PinType PinType { get; set; }
    }
}
