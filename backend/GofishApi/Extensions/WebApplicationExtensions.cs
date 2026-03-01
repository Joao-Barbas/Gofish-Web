using GofishApi.Core;
using GofishApi.Data;
using GofishApi.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace GofishApi.Extensions;

public static class WebApplicationExtensions
{
    public static void EnableSwaggerIfDevelopment(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return;
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    public static void UseAndConfigureExceptionHandler(this WebApplication app)
    {
        app.UseExceptionHandler(action =>
        {
            action.Run(async context =>
            {
                var factory   = context.RequestServices.GetRequiredService<ProblemDetailsFactory>();
                var feature   = context.Features.Get<IExceptionHandlerFeature>();
                var exception = feature?.Error;
                var problem   = exception switch
                {
                    ApiException ex => factory.CreateApiProblemDetails(
                        httpContext: context,
                        statusCode:  ex.Status,
                        title:       ex.Title ?? ex.Message,
                        detail:      ex.Detail,
                        errors:      ex.Errors
                    ),
                    _ => factory.CreateProblemDetails(
                        httpContext: context,
                        statusCode:  StatusCodes.Status500InternalServerError,
                        title:       "Unexpected server error",
                        detail:      "An unexpected error on the server has occurred"
                    )
                };
                context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/problem+json"; // RFC 7807 media type
                await context.Response.WriteAsJsonAsync<object>(problem);
            });
        });
    }

    public static async Task SeedDataAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext   = scope.ServiceProvider.GetRequiredService<AppDbContext>(); // Included it for future extensibility.
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        await SeedRolesAsync(roleManager);
    }

    /* Helpers */

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        var roles = new[] { "User", "Admin" };
        foreach (var role in roles)
        {
            if (await roleManager.RoleExistsAsync(role)) continue;
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}
