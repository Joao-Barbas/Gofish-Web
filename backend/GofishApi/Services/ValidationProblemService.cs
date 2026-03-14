using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using System.Diagnostics;

namespace GofishApi.Services;

public class ValidationProblemService : IValidationProblemService
{
    public ValidationProblem ValidationProblem(string errorCode, string errorDescription)
    {
        return TypedResults.ValidationProblem(new Dictionary<string, string[]> {{ errorCode, [errorDescription] }});
    }

    public ValidationProblem ValidationProblem(IdentityResult identityResult)
    {
        Debug.Assert(!identityResult.Succeeded);
        var errors = identityResult.Errors
        .GroupBy(e => e.Code)
        .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray());
        return TypedResults.ValidationProblem(errors);
    }

    public ValidationProblem ValidationProblem(string propertyName, params string[] propertyErrors)
    {
        return TypedResults.ValidationProblem(new Dictionary<string, string[]> {{ propertyName, propertyErrors } });
    }
}
