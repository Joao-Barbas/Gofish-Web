using Microsoft.AspNetCore.Mvc.Infrastructure;
using GofishApi.Core;

namespace GofishApi.Extensions;

public static class ProblemDetailsFactoryExtensions
{
    public static ApiProblemDetails CreateApiProblemDetails(this ProblemDetailsFactory factory,
        HttpContext httpContext,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        string? detail = null,
        string? instance = null,
        IEnumerable<ApiError>? errors = null
    ){
        var problemDetails = factory.CreateProblemDetails(httpContext, statusCode, title, type, detail, instance);
        return new ApiProblemDetails(problemDetails, errors);
    }
}
