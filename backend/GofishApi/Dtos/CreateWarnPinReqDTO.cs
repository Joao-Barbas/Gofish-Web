using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class CreateWarnPinReqDTO
    {
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
        public required WarnPinType WarnPinType { get; set; }
    }
}
