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
