using GofishApi.Models;

namespace GofishApi.Dtos
{
    public class GetPinPreviewResDTO
    {
        // Comuns a todos
        public int Id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Description { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public PinType PinType { get; set; }


        // CatchPin (opcionais)
        public string? ImageUrl { get; set; }
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
