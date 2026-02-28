using Microsoft.EntityFrameworkCore;
using GofishApi.Data;
using GofishApi.Models;
using GofishApi.Extensions;
using GofishApi.Services;
using GofishApi.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<AzureStorageOptions>(builder.Configuration.GetSection("AzureStorage"));

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();

builder.Services.AddDataProtection();
builder.Services.AddScoped<ITwoFactorTokenService, TwoFactorTokenService>();

builder.Services.AddDbContext<AppDbContext>((options) => options.UseSqlServer(builder.Configuration.GetSection("ConnectionStrings")["Default"]!));
builder.Services.AddIdentityHandlersAndStores();
builder.Services.ConfigureIdentityOptions();
builder.Services.AddAndConfigureCors();
builder.Services.AddAndConfigureIdentityAuth(builder.Configuration);
builder.Services.AddAndConfigureControllers();
builder.Services.AddAndConfigureSwaggerGen();

var app = builder.Build();
await app.SeedDataAsync();

app.UseAndConfigureExceptionHandler();
app.EnableSwaggerIfDevelopment();
app.UseHttpsRedirection();
app.UseCors("angular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

/*
 * AuthController -> authentication
 * 
 * What lives here:
 * Sign in (password)
 * Sign out
 * JWT issuance
 * Google / external login callbacks
 * 2FA verification
 * 
 * POST /api/auth/signin
 * POST /api/auth/google
 * POST /api/auth/2fa
 */

/*
 * AccountController ->  account lifecycle
 * 
 * What lives here:
 * Sign up
 * Email confirmation
 * Resend confirmation
 * Password reset
 * Change password
 * 
 * POST /api/account/signup
 * POST /api/account/confirm-email
 * POST /api/account/forgot-password
 */

/*
 * UsersController -> user data / admin
 * 
 * What lives here:
 * Get profile
 * Update profile
 * Admin user listing
 * Role management
 * 
 * GET /api/users/me
 * PUT /api/users/me
 * GET /api/users (admin only)
 */
