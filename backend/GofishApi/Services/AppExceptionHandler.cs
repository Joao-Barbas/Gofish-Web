using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using GofishApi.Exceptions;

namespace GofishApi.Services;

public class AppExceptionHandler : IExceptionHandler
{
    private readonly ILogger<AppExceptionHandler> _logger;
    private readonly ProblemDetailsFactory _factory;

    public AppExceptionHandler(
        ILogger<AppExceptionHandler> logger,
        ProblemDetailsFactory factory
    ){
        _logger  = logger;
        _factory = factory;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problem = exception switch
        {
            AppException ex => _factory.CreateProblemDetails(
                httpContext: httpContext,
                statusCode:  ex.Status,
                title:       ex.Title ?? ex.Message,
                detail:      ex.Detail
            ),
            _ => _factory.CreateProblemDetails(
                httpContext: httpContext,
                statusCode:  StatusCodes.Status500InternalServerError,
                title:       "Unexpected server error",
                detail:      "An unexpected error on the server has occurred"
            )
        };

        httpContext.Response.StatusCode  = problem.Status ?? StatusCodes.Status500InternalServerError;
        httpContext.Response.ContentType = "application/problem+json"; // RFC 7807 media type

        await httpContext.Response.WriteAsJsonAsync<object>(problem, cancellationToken);
        return true;
    }
}
