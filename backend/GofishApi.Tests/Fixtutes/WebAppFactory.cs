using GofishApi.Data;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GofishApi.Tests.Fixtures;
public class WebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));

            // Registar auteticação fake
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = FakeAuthenticationHandler.SchemeName;
                options.DefaultChallengeScheme = FakeAuthenticationHandler.SchemeName;
            })
            .AddScheme<AuthenticationSchemeOptions, FakeAuthenticationHandler>(
                FakeAuthenticationHandler.SchemeName, options => { });

            // 3) Substituir IBlobStorageService por FakeBlobStorageService
            var blobDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IBlobStorageService));

            if (blobDescriptor != null)
                services.Remove(blobDescriptor);

            services.AddSingleton<IBlobStorageService, FakeBlobStorageService>();
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

        var existingUser = new AppUser
        {
            Id = "test-user-id",
            Email = "fixture@test.com",
            UserName = "existinguser",
            FirstName = "Existing",
            LastName = "User",
            EmailConfirmed = true
        };

        await userManager.CreateAsync(existingUser, "Password123!");
    }

    public Task DisposeAsync() => Task.CompletedTask;
}