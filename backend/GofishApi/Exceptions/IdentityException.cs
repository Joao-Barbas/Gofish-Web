using Microsoft.AspNetCore.Identity;

namespace GofishApi.Exceptions;

public sealed class IdentityException : AppValidationException
{
    public IdentityException(IdentityResult result)
        : base(result.Errors.GroupBy(e => e.Code).ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray()))
    { }

    [Obsolete("Use IdentityException(IdentityResult result) instead")]
    public IdentityException(IEnumerable<IdentityError> errors)
        : base(errors.GroupBy(e => e.Code).ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray()))
    { }
}
