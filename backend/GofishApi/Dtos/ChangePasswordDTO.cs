namespace GofishApi.Dtos;

public record ChangePasswordReqDTO(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword
);

public record ChangePasswordResDTO(
    // Unused
);
