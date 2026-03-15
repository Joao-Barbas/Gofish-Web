using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace GofishApi.Extensions;

public static class ProblemDetailsFactoryExtensions
{
    public static ValidationProblemDetails CreateValidationProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        IDictionary<string, string[]> errors,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null
    )
    {
        ArgumentNullException.ThrowIfNull(errors);
        // Feed bogus ModalStateDictionary so it initializes a problem details with the framework's defaults
        // Every single thing about how entity framework does errors is fucked up already so whatever
        var vpd = factory.CreateValidationProblemDetails(httpContext, new(), statusCode, title, type, detail, instance);
        vpd.Errors = errors;
        return vpd;
    }

    public static ValidationProblemDetails CreateValidationProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        string errorCode,
        string errorDescription,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null
    )
    {
        ArgumentNullException.ThrowIfNull(errorCode);
        ArgumentNullException.ThrowIfNull(errorDescription);
        var errors = new Dictionary<string, string[]> {{ errorCode, [errorDescription] }};
        return factory.CreateValidationProblemDetails(httpContext, errors, statusCode, title, type, detail, instance);
    }

    public static ValidationProblemDetails CreateValidationProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        IdentityResult identityResult,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null
    )
    {
        ArgumentNullException.ThrowIfNull(identityResult);
        Debug.Assert(!identityResult.Succeeded);
        var errors = identityResult.Errors.GroupBy(e => e.Code).ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray());
        return factory.CreateValidationProblemDetails(httpContext, errors, statusCode, title, type, detail, instance);
    }
}
