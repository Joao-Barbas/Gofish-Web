using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using GofishApi.Core;

namespace GofishApi.Extensions;

public static class ProblemDetailsFactoryExtensions
{
    public static ApplicationProblemDetails CreateDomainProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null,
        IEnumerable<ApplicationError>? errors = null
    ){
        ProblemDetails problemDetails = factory.CreateProblemDetails(httpContext, statusCode, title, type, detail, instance);
        return new ApplicationProblemDetails(problemDetails, errors);
    }
}
