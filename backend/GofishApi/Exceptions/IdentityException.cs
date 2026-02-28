using Microsoft.AspNetCore.Identity;
using GofishApi.Core;

namespace GofishApi.Exceptions;

public class IdentityException : ApiException
{
    public IdentityException(IEnumerable<IdentityError>? errors)
        : this(errors?.Select(e => new ApiError(e.Code, e.Description)))
    { }

    public IdentityException(IEnumerable<ApiError>? errors)
        : base("Identity operation failed", StatusCodes.Status400BadRequest, errors)
    { }
}
