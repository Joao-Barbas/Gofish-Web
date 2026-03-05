namespace GofishApi.Dtos;

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

