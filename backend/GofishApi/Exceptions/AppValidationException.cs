namespace GofishApi.Exceptions;

public class AppValidationException : AppException
{
    /// <summary>
    /// Gets the validation errors associated with this exception of <see cref="HttpValidationProblemDetails"/>.
    /// </summary>
    public IDictionary<string, string[]> Errors { get; protected set; }

    public AppValidationException(
        IDictionary<string, string[]> errors,
        int? status = null,
        string? detail = null,
        string? title = null,
        string? message = null
    ) : base(message ?? detail ?? "One or more validation errors occurred.")
    {
        Errors = errors;
        Status = status ?? StatusCodes.Status400BadRequest;
        Title = title ?? "Bad Request";
        Detail = detail ?? "One or more validation errors occurred.";
    }

    public AppValidationException(
        string code,
        string description,
        int? status = null,
        string? detail = null,
        string? title = null,
        string? message = null
    ) : this(new Dictionary<string, string[]> {{ code, [description] }}, status, detail, title, message)
    { }

    public AppValidationException(
        string code,
        string description
    ) : this(new Dictionary<string, string[]> {{ code, [description] }})
    { }
}
