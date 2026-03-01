using Microsoft.AspNetCore.Mvc;
using GofishApi.Core;

namespace GofishApi.Extensions;

public static class ControllerBaseExtensions
{
    [NonAction]
    public static ObjectResult ApplicationProblem(this ControllerBase controllerBase,
        string? detail = null,
        string? instance = null,
        int? statusCode = null,
        string? title = null,
        string? type = null,
        IEnumerable<ApiError>? errors = null
    ){
        ApplicationProblemDetails apiProblemDetails;
        if (controllerBase.ProblemDetailsFactory == null)
        {
            // ProblemDetailsFactory may be null in unit testing scenarios.
            // Improvise to make this more testable.
            apiProblemDetails = new ApplicationProblemDetails
            {
                Detail = detail,
                Instance = instance,
                Status = statusCode ?? 500,
                Title = title,
                Type = type,
                Errors = errors
            };
        }
        else
        {
            apiProblemDetails = controllerBase.ProblemDetailsFactory.CreateApplicationProblemDetails(
                controllerBase.HttpContext,
                statusCode: statusCode ?? 500,
                title: title,
                type: type,
                detail: detail,
                instance: instance,
                errors: errors
            );
        }
        return new ObjectResult(apiProblemDetails)
        {
            StatusCode = apiProblemDetails.Status
        };
    }
}
