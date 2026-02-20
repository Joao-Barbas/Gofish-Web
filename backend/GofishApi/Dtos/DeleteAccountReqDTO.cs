namespace GofishApi.Dtos
{
    public record DeleteAccountReqDTO(
        string Password // TODO: Also 2FA if enabled
    );
}
