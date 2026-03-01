using GofishApi.Dtos;
using GofishApi.Exceptions;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

namespace GofishApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserAccountController : ControllerBase
    {
        private readonly ILogger<UserAccountController> _logger;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public UserAccountController(
            ILogger<UserAccountController> logger,
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager
        ){
            _logger        = logger;
            _userManager   = userManager;
            _signInManager = signInManager;
        }

        [HttpDelete("DeleteAccount")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountReqDTO dto)
        {
            // TODO: Also 2FA if enabled
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var user   = userId == null ? null : await _userManager.FindByIdAsync(userId);
            if (user is null)
            {
                throw new UnauthorizedException();
            }
            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!passwordValid)
            {
                throw new Exceptions.ApplicationException("Given credentials do not match", StatusCodes.Status400BadRequest, [
                    new("InvalidCredentials", "Given credentials do not match")
                ]);
            }
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                throw new IdentityException(result.Errors);
            }
            return NoContent();
        }

        [HttpDelete("DeletePersonalData")]
        public async Task<IActionResult> DeletePersonalData([FromBody] DeleteAccountReqDTO dto)
        {
            return await DeleteAccount(dto);
        }

        [HttpGet("DownloadPersonalData")]
        public async Task<IActionResult> DownloadPersonalData()
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var user   = userId == null ? null : await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                throw new UnauthorizedException();
            }

            // Reflect over all [PersonalData] properties on AppUser
            // Plus inherited [PersonalData] on IdentityUser

            var personalData      = new Dictionary<string, string?>();
            var personalDataProps = typeof(AppUser).GetProperties().Where(p => p.IsDefined(typeof(PersonalDataAttribute), inherit: true));
            var externalLogins    = await _userManager.GetLoginsAsync(user);
            var authenticatorKey  = await _userManager.GetAuthenticatorKeyAsync(user);

            foreach (var prop in personalDataProps)
            {
                personalData[prop.Name] = prop.GetValue(user)?.ToString();
            }
            foreach (var login in externalLogins)
            {
                personalData[$"{login.LoginProvider} login key"] = login.ProviderKey;
            }

            personalData["AuthenticatorKey"] = authenticatorKey;
            var bytes = JsonSerializer.SerializeToUtf8Bytes(personalData, new JsonSerializerOptions { WriteIndented = true }); // TODO: CA1869
            Response.Headers.Append("Content-Disposition", "attachment; filename=PersonalData.json");

            return File(bytes, "application/json");
        }
    }
}
