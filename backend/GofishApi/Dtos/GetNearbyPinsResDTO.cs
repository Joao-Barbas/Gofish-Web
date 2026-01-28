using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class GetNearbyPinsResDTO
    {
        public bool Success { get; set; }
        public List<NearbyPinDTO> Pins { get; set; } = new();

        public class NearbyPinDTO
        {
            // Comuns a todos
            public int Id { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
            public string? Description { get; set; } = "";
            public DateTime CreatedAt { get; set; }
            public PinType PinType { get; set; }

            public string Type { get; set; } = "";

            // CatchPin (opcionais)
            public SpeciesType? SpeciesType { get; set; }
            public int? HookSize { get; set; }
            public BaitType? BaitType { get; set; }

            // InfoPin (opcionais)
            public int? AccessDifficulty { get; set; }
            public SeaBedType? SeaBedType { get; set; }

            // WarnPin (opcional)
            public WarnPinType? WarnPinType { get; set; }
        }
    }
