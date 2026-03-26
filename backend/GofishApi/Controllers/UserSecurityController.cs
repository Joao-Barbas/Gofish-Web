using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UserSecurityController : ControllerBase
{
    private readonly ILogger<UserSecurityController> _logger;
    private readonly UserManager<AppUser> _userManager;

    public UserSecurityController(
        ILogger<UserSecurityController> logger,
        UserManager<AppUser> userManager
    ){
        _logger = logger;
        _userManager = userManager;
    }

    [HttpGet("GetSecurityInfo")]
    public async Task<IActionResult> GetSecurityInfo()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user   = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var logins           = await _userManager.GetLoginsAsync(user);
        var identityProvider = logins.FirstOrDefault()?.LoginProvider ?? "Local";

        return Ok(new SecurityInfoResDTO(identityProvider, user.TwoFactorEnabled, user.TwoFactorMethod));
    }

    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user   = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (dto.CurrentPassword == dto.NewPassword)
        {
            throw new AppException("Bad Request", "Your new password must be different from your current password.", StatusCodes.Status400BadRequest);
        }
        if (user.TwoFactorEnabled && user.TwoFactorMethod == TwoFactorMethod.Totp)
        {
            if (string.IsNullOrWhiteSpace(dto.TotpCode))
            {
                throw new AppException("Bad Request", "A TOTP code is required.", StatusCodes.Status400BadRequest);
            }
            if (!await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.TotpCode))
            {
                throw new AppException("Bad Request", "Incorrect code.", StatusCodes.Status400BadRequest);
            }
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        
        if (!result.Succeeded)
        {
            throw new IdentityException(result.Errors);
        }
        
        return Ok();
    }

    [HttpGet("GetTotpSetup")]
    public async Task<IActionResult> GetTotpSetup()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user   = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var key = await _userManager.GetAuthenticatorKeyAsync(user);

        if (string.IsNullOrEmpty(key))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            key = await _userManager.GetAuthenticatorKeyAsync(user);
        }

        var label = Uri.EscapeDataString($"GOFISH:{user.Email}");
        var uri   = $"otpauth://totp/{label}?secret={key}&issuer=GOFISH";

        return Ok(new GetTotpSetupResDTO(key!, uri));
    }

    [HttpPost("EnableTotp")]
    public async Task<IActionResult> EnableTotp([FromBody] EnableTotpReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user   = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (!await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.TotpCode))
        {
            throw new AppException("Bad Request", "Incorrect code.", StatusCodes.Status400BadRequest);
        }

        user.TwoFactorMethod = TwoFactorMethod.Totp;

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        await _userManager.UpdateAsync(user);

        var backupCodes = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);
        return Ok(new EnableTotpResDTO(backupCodes!.ToArray()));
    }

    [HttpPost("DisableTotp")]
    public async Task<IActionResult> DisableTotp([FromBody] DisableTotpReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user   = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (!await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.TotpCode))
        {
            throw new AppException("Bad Request", "Incorrect code.", StatusCodes.Status400BadRequest);
        }

        user.TwoFactorMethod = TwoFactorMethod.None;

        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.UpdateAsync(user);
        await _userManager.ResetAuthenticatorKeyAsync(user);

        return Ok();
    }
}
