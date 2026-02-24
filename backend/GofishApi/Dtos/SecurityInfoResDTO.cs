namespace GofishApi.Dtos
{
    public record SecurityInfoResDTO(
        bool TwoFactorEnabled,
        bool HasAuthenticatorApp
    );    
}
