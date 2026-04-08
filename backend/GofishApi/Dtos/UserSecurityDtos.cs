using System.ComponentModel.DataAnnotations;
using GofishApi.Enums;

namespace GofishApi.Dtos;

#region View Models

// ----

#endregion // View Models
#region Request-Response Wrappers

public record SecurityInfoReqDTO(
    // Unused
);
public record SecurityInfoResDTO(
    string IdentityProvider,
    bool TwoFactorEnabled,
    TwoFactorMethod TwoFactorMethod,
    bool EmailConfirmed
);

public record ValidateTwoFactorCodeReqDto(
    [Required] string Code
);
public record ValidateTwoFactorCodeResDto(
    string Token
);

public record GetTotpSetupReqDTO(
    // Unused
);
public record GetTotpSetupResDTO(
    string AuthenticatorKey,
    string QrCodeUri
);

public record EnableTotpReqDTO(
    string TotpCode
);
public record EnableTotpResDTO(
    string[] BackupCodes
);

public record DisableTotpReqDTO(
    string TotpCode
);
public record DisableTotpResDTO(
    // Unused
);

public record VerifyEmailReqDto(
    [Required] string Code
);
public record VerifyEmailResDto(
    // Unused
);

public record InitiateEmailChangeReqDto(
    [Required] [EmailAddress] string NewEmail,
    string? TwoFactorToken = null // Required when the user has 2FA enabled
);
public record InitiateEmailChangeResDto(
    string Token
);

public record CompleteEmailChangeReqDto(
    [Required] string Token,
    [Required] string Code
);
public record CompleteEmailChangeResDto(
    // Unused
);

public record ChangePasswordReqDTO(
    [Required] string CurrentPassword,
    [Required] string NewPassword,
    string? TwoFactorCode
);
public record ChangePasswordResDTO(
    // Unused
);

public sealed record ForgotPasswordReqDto
{
    public required string Email { get; init; }
}
public sealed record ForgotPasswordResDto { } // Unused

public sealed record ResetPasswordReqDto
{
    public required string Email { get; init; }
    public required string Code { get; init; }
    public required string NewPassword { get; init; }
}
public sealed record ResetPasswordResDto { } // Unused

#endregion // Request-Response Wrappers
