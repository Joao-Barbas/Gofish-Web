using GofishApi.Enums;

namespace GofishApi.Dtos;

public record SecurityInfoReqDTO(
    // Unused
);

public record SecurityInfoResDTO(
    bool TwoFactorEnabled,
    TwoFactorMethod TwoFactorMethod
);    
