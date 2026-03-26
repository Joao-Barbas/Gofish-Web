using GofishApi.Enums;

namespace GofishApi.Dtos;

public record SecurityInfoReqDTO(
    // Unused
);

public record SecurityInfoResDTO(
    string IdentityProvider,
    bool TwoFactorEnabled,
    TwoFactorMethod TwoFactorMethod
);
