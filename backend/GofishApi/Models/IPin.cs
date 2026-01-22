
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Models
{
    public interface IPin
    {
        int Id { get; set; }
        double Latitude { get; set; }
        double Longitude { get; set; }
        string? Description { get; set; }
        DateTime CreatedAt { get; set; }
        PinType PinType { get; set; }
    }
}
