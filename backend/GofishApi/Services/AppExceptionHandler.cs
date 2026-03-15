using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using GofishApi.Exceptions;
using GofishApi.Extensions;
using Microsoft.AspNetCore.Mvc;

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
        object problem = exception switch
        {
            AppValidationException ex => _factory.CreateValidationProblemDetails(
                httpContext: httpContext,
                errors:      ex.Errors,
                statusCode:  ex.Status,
                title:       ex.Title,
                detail:      ex.Detail ?? ex.Message
            ),
            AppException ex => _factory.CreateProblemDetails(
                httpContext: httpContext,
                statusCode:  ex.Status,
                title:       ex.Title,
                detail:      ex.Detail ?? ex.Message
            ),
            _ => _factory.CreateProblemDetails(
                httpContext: httpContext,
                statusCode: StatusCodes.Status500InternalServerError,
                title: "Internal server error",
                detail: "An unexpected error on the server has occurred"
            )
        };

        var status = problem switch
        {
            ProblemDetails pd => pd.Status ?? 500,
            _ => 500
        };

        httpContext.Response.StatusCode = status;
        httpContext.Response.ContentType = "application/problem+json"; // RFC 7807 media type

        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
