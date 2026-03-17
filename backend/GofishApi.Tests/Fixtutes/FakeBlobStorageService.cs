using GofishApi.Services;
using Microsoft.AspNetCore.Http;

namespace GofishApi.Tests.Fixtures;

public class FakeBlobStorageService : IBlobStorageService
{
    public Task<string> UploadImageAsync(IFormFile file)
    {
        // devolve sempre um URL fake
        return Task.FromResult("https://fake.blobstorage.local/test-image.png");
    }

    public Task<string> UploadAvatarAsync(IFormFile file) 
    {
        return Task.FromResult("https://fake.blobstorage.local/test-image.png");
    }

    public Task DeleteImageAsync(string imageUrl)
    {
        // Não faz nada (fake)
        return Task.CompletedTask;
    }

    public Task<string> UploadAvatarAsync(IFormFile file)
    {
        throw new NotImplementedException();
    }
}