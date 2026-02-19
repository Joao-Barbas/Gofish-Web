using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using GofishApi.Options;
using GofishApi.Models;

namespace GofishApi.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtOptions _jwt;

        public JwtService(IOptions<JwtOptions> options)
        {
            _jwt = options.Value;
        }

        public Task<string> CreateTokenAsync(AppUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret!));
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")), // No dashes
                new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? ""),
                new(JwtRegisteredClaimNames.GivenName, user.FirstName ?? ""),
                new(JwtRegisteredClaimNames.FamilyName, user.LastName ?? ""),
                new(JwtRegisteredClaimNames.Email, user.Email ?? "")
            };
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
            return Task.FromResult(token);
        }

        // Optional Future Improvement:
        // Consider adding CreatedByUser navigation everywhere(Pins, Posts, Comments) to simplify queries.
        // Consider claiming Name or Email in JWT if you need it for auditing.
        // For revocable tokens, consider refresh tokens stored in DB.
    }
}
