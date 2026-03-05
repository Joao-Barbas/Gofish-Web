using Microsoft.AspNetCore.Identity;

namespace GofishApi.Exceptions;

public sealed class IdentityException : AppException
{
    public IdentityException(string? message, string? detail)
        : base(message, detail, StatusCodes.Status400BadRequest)
    { }

    public IdentityException(string? detail)
        : this("Identity Error", detail)
    { }

    public IdentityException(IEnumerable<IdentityError>? errors)
        : this("Identity Error", errors?.First().Description)
    { }
}
