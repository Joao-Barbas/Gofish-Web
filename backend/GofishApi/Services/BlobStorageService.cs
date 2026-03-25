using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using GofishApi.Options;
using Microsoft.Extensions.Options;

namespace GofishApi.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly AzureStorageOptions _options;
    private readonly BlobServiceClient _blobServiceClient;

    public BlobStorageService(IOptions<AzureStorageOptions> options)
    {
        _options = options.Value;
        _blobServiceClient = new BlobServiceClient(_options.ConnectionString);
    }

    private async Task<string> UploadBlobAsync(IFormFile file, string containerName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var blobClient = containerClient.GetBlobClient(fileName);

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobHttpHeaders
        {
            ContentType = file.ContentType
        });

        return blobClient.Uri.ToString();
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        return await UploadBlobAsync(file, _options.ContainerPostImages!);
    }

    public async Task<string> UploadUserAvatarAsync(IFormFile file)
    {
        return await UploadBlobAsync(file, _options.ContainerUserAvatars!);
    }

    public async Task<string> UploadGroupAvatarAsync(IFormFile file)
    {
        return await UploadBlobAsync(file, _options.ContainerGroupAvatars!);
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        var uri = new Uri(imageUrl);
        var containerName = uri.Segments[1].TrimEnd('/');
        var blobName = uri.Segments.Last();

        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.DeleteIfExistsAsync();
    }
}
