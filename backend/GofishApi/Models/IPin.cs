namespace GofishApi.Models
{
    public interface IPin
    {
        int Id { get; set; }
        int Latitude { get; set; }
        int Longitude { get; set; }
        string? Description { get; set; }
        DateTime CreatedAt { get; set; }
        PinType PinType { get; set; }
    }
}
