using GofishApi.Data;
using GofishApi.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GofishApi.Tests.Fixtutes;

// Fixtures/WebAppFactory.cs
public class WebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // 1. Remover o SQL Server real
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            // 2. Adicionar base de dados falsa em memória
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("TestDb"));
        });
    }
    protected override void ConfigureClient(HttpClient client)
    {
        using var scope = Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var existingUser = new AppUser
        {
            Email = "fixture@test.com",
            UserName = "existinguser",
            FirstName = "Existing",
            LastName = "User",
            EmailConfirmed = true
        };

        if (userManager.FindByEmailAsync(existingUser.Email).Result is null)
            userManager.CreateAsync(existingUser, "Password123!").Wait();
    }
}