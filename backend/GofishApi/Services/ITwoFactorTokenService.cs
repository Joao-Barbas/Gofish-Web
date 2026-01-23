using GofishApi.Models;

namespace GofishApi.Services
{
    public interface ITwoFactorTokenService
    {
        string CreateTwoFactorToken(AppUser user);
        bool VerifyTwoFactorToken(string token, out string userId);
    }
}
