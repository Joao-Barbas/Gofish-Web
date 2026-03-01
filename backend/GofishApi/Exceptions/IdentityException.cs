using Microsoft.AspNetCore.Identity;
using GofishApi.Core;

namespace GofishApi.Exceptions;

public sealed class IdentityException : ApplicationOperationException
{
    public IdentityException(IEnumerable<ApplicationError>? errors)
        : base("One or more identity validation errors occurred", StatusCodes.Status400BadRequest, errors)
    { }

    public IdentityException(IEnumerable<IdentityError>? errors)
        : this(errors?.Select(e => new ApplicationError { Code = e.Code, Description = e.Description }))
    { }
}
