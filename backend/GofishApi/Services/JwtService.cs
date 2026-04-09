using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using GofishApi.Options;
using GofishApi.Models;
using System.Data;
using Microsoft.AspNetCore.Identity;

namespace GofishApi.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtOptions _jwt;
        private readonly UserManager<AppUser> _userManager;

        public JwtService(
            IOptions<JwtOptions> options,
            UserManager<AppUser> userManager
        ){
            _jwt = options.Value;
            _userManager = userManager;
        }

        public async Task<string> CreateTokenAsync(AppUser user, IList<string> roles)
        {
            var logins   = await _userManager.GetLoginsAsync(user);
            var provider = logins.FirstOrDefault()?.LoginProvider;

            var key    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret!));
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")), // No dashes
                new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? ""),
                new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new("display_name", user.DisplayName ?? user.UserName ?? ""),
                new("login_provider", provider ?? "Local")
            };
            
            foreach (var role in roles)
            {
                claims.Add(new(ClaimTypes.Role, role));
            }

            var descriptor = new SecurityTokenDescriptor
            {
                Subject            = new ClaimsIdentity(claims),
                Expires            = DateTime.UtcNow.AddMinutes(_jwt.ExpirationMinutes),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                Issuer             = _jwt.Issuer,
                Audience           = _jwt.Audience
            };

            var handler = new JwtSecurityTokenHandler();
            var token = handler.WriteToken(handler.CreateToken(descriptor));

            return await Task.FromResult(token);
        }

        public async Task<string> CreateTokenAsync(AppUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return await CreateTokenAsync(user, roles);
        }

        // Optional Future Improvement:
        // Consider adding CreatedByUser navigation everywhere(Pins, Posts, Comments) to simplify queries.
        // Consider claiming Name or Email in JWT if you need it for auditing.
        // For revocable tokens, consider refresh tokens stored in DB.
    }
}
