namespace GofishApi.Services;

public interface ISensitiveActionTokenService
{
    string CreateToken(string userId);
    bool VerifyToken(string token, out string userId);
}
