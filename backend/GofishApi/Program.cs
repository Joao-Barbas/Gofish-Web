using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using GofishApi.Data;
using GofishApi.Models;
using GofishApi.Extensions;
using GofishApi.Services;
using GofishApi.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddDbContext<AppDbContext>((options) => options.UseSqlServer(builder.Configuration.GetSection("ConnectionStrings")["Default"]!));
builder.Services.AddIdentityHandlersAndStores();
builder.Services.ConfigureIdentityOptions();
builder.Services.AddAndConfigureCors();
builder.Services.AddIdentityAuth(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddAndConfigureSwaggerGen();

var app = builder.Build();

app.EnableSwaggerIfIsDevelopment();
app.UseHttpsRedirection();
app.UseCors("angular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGroup("/api").MapIdentityApi<AppUser>();

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
