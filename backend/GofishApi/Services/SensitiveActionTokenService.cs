using Microsoft.AspNetCore.DataProtection;

namespace GofishApi.Services;

public class SensitiveActionTokenService : ISensitiveActionTokenService
{
    private readonly ITimeLimitedDataProtector _protector;

    public SensitiveActionTokenService(IDataProtectionProvider provider)
    {
        _protector = provider
            .CreateProtector("Auth.SensitiveAction.v1")
            .ToTimeLimitedDataProtector();
    }

    public string CreateToken(string userId)
    {
        return _protector.Protect(userId, TimeSpan.FromMinutes(5));
    }

    public bool VerifyToken(string token, out string userId)
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
