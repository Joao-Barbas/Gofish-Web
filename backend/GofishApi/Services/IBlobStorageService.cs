namespace GofishApi.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<string> UploadUserAvatarAsync(IFormFile file);
        Task<string> UploadGroupAvatarAsync(IFormFile file);
        Task DeleteImageAsync(string imageUrl);
    }
}