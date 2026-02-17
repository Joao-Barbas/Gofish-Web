namespace GofishApi.Dtos
{
    public record SignInResDTO(
        string? Token           = null,
        bool? RequiresTwoFactor = null,
        string? TwoFactorToken  = null
    );
}
