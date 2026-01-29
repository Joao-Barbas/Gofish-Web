using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class CreateCatchPinReqDTO
    {
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
        public required string Description { get; set; }
        public required SpeciesType SpeciesType { get; set; }
        public required int HookSize { get; set; }
        public required BaitType BaitType { get; set; }
    }
}
