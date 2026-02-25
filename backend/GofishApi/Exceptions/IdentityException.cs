using Microsoft.AspNetCore.Identity;

namespace GofishApi.Exceptions;

public class IdentityException : Exception
{
    public IEnumerable<IdentityError> Errors { get; set; }

    public IdentityException(IEnumerable<IdentityError> errors)
        : base("Identity operation failed")
    {
        Errors = errors;
    }
}
