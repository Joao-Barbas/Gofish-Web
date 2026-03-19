using System.ComponentModel.DataAnnotations;

namespace GofishApi.Dtos;

public record SignInReqDTO(
    string EmailOrUserName,
    string Password
);

public record SignInResDTO(
    string? Token           = null,
    bool? RequiresTwoFactor = null,
    string? TwoFactorToken  = null
);

public record TwoFactorSignInReqDTO(
    [Required] string TwoFactorToken,
    [Required] string TwoFactorCode
);

public record TwoFactorSignInResDTO(
    string Token
);

public record ExternalSignInResDTO(
    string Token
)
{ }
