using Microsoft.AspNetCore.Identity;
using GofishApi.Core;

namespace GofishApi.Exceptions;

public sealed class IdentityException : DomainException
{
    public IdentityException(Dictionary<string, string>? errors)
        : base("One or more identity validation errors occurred", StatusCodes.Status400BadRequest, errors)
    { }

    public IdentityException(IEnumerable<IdentityError>? errors)
        : this(errors?.ToDictionary((e) => e.Code, (e) => e.Description))
    { }
}
