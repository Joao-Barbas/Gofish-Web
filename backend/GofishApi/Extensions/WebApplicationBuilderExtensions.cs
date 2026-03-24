using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using GofishApi.Data;
using GofishApi.Models;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GofishApi.Extensions;

public static class WebApplicationBuilderExtensions
{
    public static void AddIdentityHandlersAndStores(this IServiceCollection services)
    {
        services
        .AddIdentityCore<AppUser>()
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders()
        .AddSignInManager();
    }

    public static void ConfigureIdentityOptions(this IServiceCollection services)
    {
        services.Configure<IdentityOptions>((options) =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = false;
            options.User.RequireUniqueEmail = true;
        });
    }

    public static void AddAndConfigureCors(this IServiceCollection services)
    {
        services.AddCors((options) =>
        {
            options.AddPolicy("angular", (policy) =>
            {
                policy.WithOrigins("http://localhost:4200", "https://purple-sea-059c7c603.4.azurestaticapps.net")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
        });
    }

    public static void AddAndConfigureIdentityAuth(this IServiceCollection services, IConfiguration configuration)
    {
        // JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
        // JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

        services
        .AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultSignInScheme       = IdentityConstants.ExternalScheme;
        })
        .AddJwtBearer((options) =>
        {
            options.MapInboundClaims = false;
            options.SaveToken = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("Jwt")["Secret"]!)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                NameClaimType = JwtRegisteredClaimNames.UniqueName,
                RoleClaimType = "role"//ClaimTypes.Role
            };
        })
        .AddCookie(IdentityConstants.ExternalScheme) // Needed for OAuth callback state
        .AddGoogle(options =>
        {
            options.ClientId = configuration["Authentication:Google:ClientId"]!;
            options.ClientSecret = configuration["Authentication:Google:ClientSecret"]!;
            options.CorrelationCookie.SameSite = SameSiteMode.None;  // Required for redirect flow
            options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
        });

        // services
        // .AddAuthorizationBuilder()
        // .AddFallbackPolicy(
        //     "Bearer",
        //     new AuthorizationPolicyBuilder()
        //     .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
        //     .RequireAuthenticatedUser()
        //     .Build()
        // );

        services.AddAuthorization();
    }

    public static void AddAndConfigureSwaggerGen(this IServiceCollection services)
    {
        services
        .AddEndpointsApiExplorer()
        .AddSwaggerGen((options) =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorizations",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Fill in the JWT token"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new List<String>()
                }
            });
        });
    }

    public static void AddAndConfigureControllers(this IServiceCollection services)
    {
        services
        .AddControllers()
        .AddJsonOptions(
           o => o.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        );
    }
}
