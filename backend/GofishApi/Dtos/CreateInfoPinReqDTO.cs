using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class CreateInfoPinReqDTO
    {
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
        public required string Description { get; set; }
        public required int AccessDifficulty { get; set; }
        public required SeaBedType SeaBedType { get; set; }

    }
}
