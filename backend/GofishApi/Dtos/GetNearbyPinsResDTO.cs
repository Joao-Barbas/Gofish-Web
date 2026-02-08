using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class GetNearbyPinsResDTO
    {
        public bool Success { get; set; }
        public List<NearbyPinDTO> Pins { get; set; } = new();

        public class NearbyPinDTO
        {
            public int Id { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
            public DateTime CreatedAt { get; set; }
            public PinType PinType { get; set; }
        }
    }
}
