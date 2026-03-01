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
