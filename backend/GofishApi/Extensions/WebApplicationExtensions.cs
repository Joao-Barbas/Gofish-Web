using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GofishApi.Data;
using GofishApi.Models;

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

        var dbContext   = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        
        await SeedRolesAsync(roleManager);
        await SeedGroupRolesAsync(dbContext);
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

    private static async Task SeedGroupRolesAsync(AppDbContext dbContext)
    {
        var roles = new GroupRole[]
        {
            new() { Name = "Member", NormalizedName = "MEMBER" },
            new() { Name = "Owner", NormalizedName = "OWNER" },
            new() { Name = "Moderator", NormalizedName = "MODERATOR" }
        };
        foreach (var role in roles)
        {
            var exists = await dbContext.GroupRoles.AnyAsync(gr => gr.Name == role.Name);
            if (!exists)
            {
                dbContext.GroupRoles.Add(role);
            }
        }
        await dbContext.SaveChangesAsync();
    }
}
