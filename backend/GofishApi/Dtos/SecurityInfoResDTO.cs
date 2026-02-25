using GofishApi.Enums;

namespace GofishApi.Dtos
{
    public record SecurityInfoResDTO(
        bool TwoFactorEnabled,
        TwoFactorMethod TwoFactorMethod
    );    
}
