namespace GofishApi.Options
{
    public class AzureStorageOptions
    {
        public string? ConnectionString { get; set; }
        public string? ContainerGroupAvatars { get; set; }
        public string? ContainerPostImages { get; set; }
        public string? ContainerUserAvatars { get; set; }
    }
}
