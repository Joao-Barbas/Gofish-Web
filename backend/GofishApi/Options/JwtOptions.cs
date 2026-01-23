namespace GofishApi.Options
{
    public class JwtOptions
    {
        public string? Audience { get; set; }
        public string? Issuer { get; set; }
        public string? Secret { get; set; }
        public int ExpirationMinutes { get; set; } = 1440;
    }
}
