namespace GofishApi.Dtos;

public record DeleteAccountReqDTO(
    string Password // TODO: Also 2FA if enabled
);

public record DeleteAccountResDTO(
    // 204 No Content
);
