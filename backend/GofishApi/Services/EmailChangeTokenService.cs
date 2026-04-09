using Microsoft.AspNetCore.DataProtection;

namespace GofishApi.Services;

public class EmailChangeTokenService : IEmailChangeTokenService
{
    private readonly ITimeLimitedDataProtector _protector;

    public EmailChangeTokenService(IDataProtectionProvider provider)
    {
        _protector = provider
            .CreateProtector("EmailChange.PendingCode.v1")
            .ToTimeLimitedDataProtector();
    }

    public string CreateToken(string userId, string newEmail, out string code)
    {
        code = Random.Shared.Next(100_000, 1_000_000).ToString();
        var payload = $"{userId}|{newEmail}|{code}";
        return _protector.Protect(payload, TimeSpan.FromMinutes(15));
    }

    public bool VerifyToken(string token, string submittedCode, out string userId, out string newEmail)
    {
        userId = newEmail = string.Empty;
        try
        {
            var payload = _protector.Unprotect(token);
            var parts   = payload.Split('|', 3);
            if (parts.Length != 3)        return false;
            if (parts[2] != submittedCode) return false;
            userId  = parts[0];
            newEmail = parts[1];
            return true;
        }
        catch
        {
            return false;
        }
    }
}
