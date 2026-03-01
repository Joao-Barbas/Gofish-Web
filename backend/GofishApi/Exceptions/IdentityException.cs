using Microsoft.AspNetCore.Identity;
using GofishApi.Core;

namespace GofishApi.Exceptions;

public sealed class IdentityException : ApplicationException
{
    public IdentityException(IEnumerable<ApiError>? errors)
        : base("One or more identity validation errors occurred", StatusCodes.Status400BadRequest, errors)
    { }

    public IdentityException(IEnumerable<IdentityError>? errors)
        : this(errors?.Select(e => new ApiError(e.Code, e.Description)))
    { }
}
