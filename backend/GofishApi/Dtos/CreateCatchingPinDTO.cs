using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class CreateCatchingPinDTO
    {
        public required int Latitude { get; set; }
        public required int Longitude { get; set; }
        public required string Description { get; set; }
        public required Species SpeciesType { get; set; }
        public required int HookSize { get; set; }
        public required BaitType BaitType { get; set; }
    }
}
