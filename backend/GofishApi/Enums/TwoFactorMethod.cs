namespace GofishApi.Enums;

public enum TwoFactorMethod
{
    None  = 0,
    Totp  = 1,
    Email = 2,
    Sms   = 3  // Just here. Won't implement
}
