
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models
{
    public class CatchPin : PinBase
    {
        public const int ExpiredInDays = 7;
        public SpeciesType? SpeciesType { get; set; }
        public int? HookSize { get; set; }
        public BaitType? BaitType { get; set; }
        
        [Required]
        [MaxLength(500)]
        public required string ImageUrl { get; set; }
    }
}
