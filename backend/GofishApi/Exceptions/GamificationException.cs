using GofishApi.Services;
using Microsoft.AspNetCore.Identity;

namespace GofishApi.Exceptions;

public sealed class GamificationException : AppException
{
    public GamificationException(
        GamificationResult result,
        int? status = null
    ) : base(detail: result.Error, status: status ?? StatusCodes.Status403Forbidden)
    { }

    public GamificationException(
        string error,
        int? status
    ) : this(GamificationResult.Failed(error), status)
    { }
}
