using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace GofishApi.Services;

public interface IValidationProblemService
{
    public ValidationProblem ValidationProblem(string errorCode, string errorDescription);
    public ValidationProblem ValidationProblem(IdentityResult identityResult);
    public ValidationProblem ValidationProblem(string propertyName, params string[] propertyErrors);
}
