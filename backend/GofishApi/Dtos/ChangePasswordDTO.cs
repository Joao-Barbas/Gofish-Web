using System.ComponentModel.DataAnnotations;

namespace GofishApi.Dtos;

public record ChangePasswordReqDTO(
    [Required]
    string CurrentPassword,
    [Required]
    string NewPassword,
    string? TotpCode
);

public record ChangePasswordResDTO(
    // Unused
);
