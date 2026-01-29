
namespace GofishApi.Models
{
    public class CatchPin : PinBase
    {
        public SpeciesType? SpeciesType { get; set; }
        public int? HookSize { get; set; }
        public BaitType? BaitType { get; set; }
    }
}
