namespace GofishApi.Dtos;

public record ChangePasswordReqDTO(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword
);

/*

    [Required]
    [StringLength(100, MinimumLength = 6)]
    string CurrentPassword,
    
    [Required]
    [StringLength(100, MinimumLength = 6)]
    string NewPassword,
    
    [Required]
    [Compare(nameof(NewPassword))]
    string ConfirmPassword
 
*/
