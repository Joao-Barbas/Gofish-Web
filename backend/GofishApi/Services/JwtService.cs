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
                new("UserId", user.Id)
                // new Claim(ClaimTypes.Name, user.UserName),
                // new Claim(ClaimTypes.Email, user.Email)
            };
            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwt.ExpirationMinutes),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
            };
            var handler = new JwtSecurityTokenHandler();
            var token = handler.WriteToken(handler.CreateToken(descriptor));
            return Task.FromResult(token);
        }
    }
}
