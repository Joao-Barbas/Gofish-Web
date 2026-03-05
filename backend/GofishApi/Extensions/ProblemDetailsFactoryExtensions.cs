using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Identity;
using System.Diagnostics;

namespace GofishApi.Extensions;

public static class ProblemDetailsFactoryExtensions
{
    public static ValidationProblemDetails CreateValidationProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        string errorCode,
        string errorDescription,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null
    ){
        // Pass hacky bogus ModalStateDictionary so it just creates details with the defaults
        // Every single thing about how entity framework does errors is fucked up already so whatever
        var validationProblemDetails = factory.CreateValidationProblemDetails(httpContext, new(), statusCode, title, type, detail, instance);
        validationProblemDetails.Errors.Add(errorCode, [errorDescription]);
        return validationProblemDetails;
    }

    public static ValidationProblemDetails CreateValidationProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        IdentityResult identityResult,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null
    ){
        Debug.Assert(!identityResult.Succeeded);
        var validationProblemDetails = factory.CreateValidationProblemDetails(httpContext, new(), statusCode, title, type, detail, instance);
        validationProblemDetails.Errors = identityResult.Errors.GroupBy(e => e.Code).ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray()); 
        return validationProblemDetails;
    }
}
