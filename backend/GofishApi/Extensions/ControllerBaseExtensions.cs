using Microsoft.AspNetCore.Mvc;
using GofishApi.Core;

namespace GofishApi.Extensions;

public static class ControllerBaseExtensions
{
    [NonAction]
    public static ObjectResult DomainProblem(this ControllerBase controllerBase,
        string? detail = null,
        string? instance = null,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        IDictionary<string, string>? errors = null
    ){
        DomainProblemDetails domainProblemDetails;
        if (controllerBase.ProblemDetailsFactory == null)
        {
            // ProblemDetailsFactory may be null in unit testing scenarios.
            // Improvise to make this more testable.
            domainProblemDetails = new DomainProblemDetails
            {
                Detail   = detail,
                Instance = instance,
                Status   = statusCode ?? 500,
                Title    = title,
                Type     = type,
                Errors   = errors
            };
        }
        else
        {
            domainProblemDetails = controllerBase.ProblemDetailsFactory.CreateApplicationProblemDetails(
                httpContext: controllerBase.HttpContext,
                statusCode:  statusCode ?? 500,
                title:       title,
                type:        type,
                detail:      detail,
                instance:    instance,
                errors:      errors
            );
        }
        return new ObjectResult(domainProblemDetails)
        {
            StatusCode = domainProblemDetails.Status
        };
    }
}
