using Microsoft.AspNetCore.Identity;

namespace GofishApi.Dtos
{
    public record SignUpResDTO(
        bool Success = true,
        IEnumerable<IdentityError> Errors = default!
    );
}
