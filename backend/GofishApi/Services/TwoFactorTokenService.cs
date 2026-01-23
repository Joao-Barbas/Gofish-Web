using GofishApi.Models;
using Microsoft.AspNetCore.DataProtection;

namespace GofishApi.Services
{
    public class TwoFactorTokenService : ITwoFactorTokenService
    {
        private readonly ITimeLimitedDataProtector _protector;

        public TwoFactorTokenService(IDataProtectionProvider provider)
        {
            // purpose string isolates this from other protected payloads in your app
            _protector = provider
            .CreateProtector("Auth.2FA.PendingToken.v1")
            .ToTimeLimitedDataProtector();
        }

        public string CreateTwoFactorToken(AppUser user)
        {
            return _protector.Protect(user.Id, TimeSpan.FromMinutes(5));
        }

        public bool VerifyTwoFactorToken(string token, out string userId)
        {
            userId = string.Empty;
            try
            {
                userId = _protector.Unprotect(token);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
