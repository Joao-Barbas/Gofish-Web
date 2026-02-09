namespace GofishApi.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task DeleteImageAsync(string imageUrl);
    }
}