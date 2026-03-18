using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace GofishApi.Extensions;

public static class EnumExtensions
{
    public static bool HasDisplayName(this Enum e) => !string.IsNullOrEmpty(e.ToDisplayName());
    public static bool HasDescription(this Enum e) => !string.IsNullOrEmpty(e.ToDescription());

    public static string? ToDisplayName(this Enum e) => e
        .GetType()
        .GetField(e.ToString())?
        .GetCustomAttribute<DisplayAttribute>()?
        .GetName();

    public static string? ToDescription(this Enum e) => e
        .GetType()
        .GetField(e.ToString())?
        .GetCustomAttribute<DisplayAttribute>()?
        .GetDescription();

    public static int ToValue(this Enum e) => Convert.ToInt32(e);
}
