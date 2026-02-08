using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using GofishApi.Options;
using Microsoft.Extensions.Options;

namespace GofishApi.Services
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly AzureStorageOptions _blob;
        private readonly BlobContainerClient _containerClient;

        public BlobStorageService(IOptions<AzureStorageOptions> options)
        {
            _blob = options.Value;
            _containerClient = new BlobContainerClient(_blob.ConnectionString, _blob.ContainerName);
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var blobClient = _containerClient.GetBlobClient(fileName);

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders
            {
                ContentType = file.ContentType
            });

            return blobClient.Uri.ToString();
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            var blobName = new Uri(imageUrl).Segments.Last();
            var blobClient = _containerClient.GetBlobClient(blobName);
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
