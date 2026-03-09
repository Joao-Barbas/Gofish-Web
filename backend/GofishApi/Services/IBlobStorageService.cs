namespace GofishApi.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<string> UploadAvatarAsync(IFormFile file);
        Task DeleteImageAsync(string imageUrl);
    }
}