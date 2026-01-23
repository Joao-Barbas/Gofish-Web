namespace GofishApi.Dtos
{
    public record SignInResDTO(
        bool Success = true,
        string? Token = null,
        bool? RequiresTwoFactor = null,
        string? TwoFactorToken = null,
        string? ErrorCode = null,
        string? ErrorDescription = null
    );
}
