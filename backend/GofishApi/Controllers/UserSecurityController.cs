using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Drawing;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UserSecurityController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly ISensitiveActionTokenService _actionTokenService;
    private readonly IEmailChangeTokenService _emailChangeTokenService;

    public UserSecurityController(
        UserManager<AppUser> userManager,
        IEmailService emailService,
        ISensitiveActionTokenService actionTokenService,
        IEmailChangeTokenService emailChangeTokenService
    ){
        _userManager = userManager;
        _emailService = emailService;
        _actionTokenService = actionTokenService;
        _emailChangeTokenService = emailChangeTokenService;
    }

    [HttpGet("GetSecurityInfo")]
    public async Task<IActionResult> GetSecurityInfo()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var logins = await _userManager.GetLoginsAsync(user);
        var identityProvider = logins.FirstOrDefault()?.LoginProvider ?? "Local";

        return Ok(new SecurityInfoResDTO(identityProvider, user.TwoFactorEnabled, user.TwoFactorMethod, user.EmailConfirmed));
    }

    /// <summary>
    /// Verifies the user's active 2FA method (TOTP or email code) and returns
    /// a short-lived action token (5 min) the frontend must send when performing
    /// a sensitive action like changing email.
    /// Call this only when the user actually has 2FA enabled.
    /// </summary>
    [HttpPost("ValidateTwoFactorCode")]
    public async Task<IActionResult> ValidateTwoFactorCode([FromBody] ValidateTwoFactorCodeReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (!user.TwoFactorEnabled)
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Two-factor authentication is not enabled.");
        }

        var tokenProvider = user.TwoFactorMethod switch
        {
            TwoFactorMethod.Email => TokenOptions.DefaultEmailProvider,
            TwoFactorMethod.Sms => TokenOptions.DefaultPhoneProvider,
            _ => _userManager.Options.Tokens.AuthenticatorTokenProvider
        };

        if (!await _userManager.VerifyTwoFactorTokenAsync(user, tokenProvider, dto.Code))
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Incorrect code.");
        }

        var token = _actionTokenService.CreateToken(user.Id);
        return Ok(new ValidateTwoFactorCodeResDto(token));
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
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Your new password must be different from your current password.");
        }
        if (user.TwoFactorEnabled)
        {
            if (string.IsNullOrWhiteSpace(dto.TwoFactorCode))
            {
                throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "A two-factor code is required.");
            }

            var tokenProvider = user.TwoFactorMethod switch
            {
                TwoFactorMethod.Email => TokenOptions.DefaultEmailProvider,
                TwoFactorMethod.Sms => TokenOptions.DefaultPhoneProvider,
                _ => _userManager.Options.Tokens.AuthenticatorTokenProvider
            };

            if (!await _userManager.VerifyTwoFactorTokenAsync(user, tokenProvider, dto.TwoFactorCode))
            {
                throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Incorrect code.");
            }
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
        {
            throw new IdentityException(result.Errors);
        }

        return Ok();
    }

    [HttpPost("SendTwoFactorEmail")]
    public async Task<IActionResult> SendTwoFactorEmail()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (user.Email is null)
        {
            return BadRequest();
        }
        if (!user.TwoFactorEnabled || user.TwoFactorMethod != TwoFactorMethod.Email)
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Prefered two factor method is not email");
        }

        var code = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
        var (subject, body) = EmailResources.TwoFactorEmail(code);
        await _emailService.SendAsync(user.Email, subject, body);

        return Ok();
    }

    // Forgot password

    /// <summary>
    /// Starts the proccess of a password reset.
    /// Sends to user's email a 6-digit code.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("ForgotPassoword")]
    public async Task<IActionResult> ForgotPassoword([FromBody] ForgotPasswordReqDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user is not null && await _userManager.IsEmailConfirmedAsync(user))
        {
            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            var (subject, body) = EmailResources.ResetPassword(code);
            await _emailService.SendAsync(dto.Email, subject, body);
        }

        // Don't reveal that the user does not exist or is not confirmed, so don't return a 200 if we would have
        // returned a 400 for an invalid code given a valid user email.
        return Ok();
    }

    /// <summary>
    /// Ends the process of email verification.
    /// Resets the password using the given values.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("ResetPassword")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordReqDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user is null || !(await _userManager.IsEmailConfirmedAsync(user)))
        {
            // Don't reveal that the user does not exist or is not confirmed, so don't return a 200 if we would have
            // returned a 400 for an invalid code given a valid user email.
            throw new IdentityException(_userManager.ErrorDescriber.InvalidToken());
        }

        IdentityResult result;

        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(dto.Code));
            result = await _userManager.ResetPasswordAsync(user, code, dto.NewPassword);
        }
        catch (FormatException)
        {
            result = IdentityResult.Failed(_userManager.ErrorDescriber.InvalidToken());
        }
        if (!result.Succeeded)
        {
            throw new IdentityException(result);
        }

        return Ok();
    }

    // Change email

    /// <summary>
    /// Initiates an email change.
    /// Sends a 6-digit code to the new address and returns a token (encodes userId + newEmail + code, 15 min TTL).
    /// The frontend holds the token and asks the user to enter the code.
    /// </summary>
    [HttpPost("InitiateEmailChange")]
    public async Task<IActionResult> InitiateEmailChange([FromBody] InitiateEmailChangeReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (user.TwoFactorEnabled)
        {
            if (string.IsNullOrWhiteSpace(dto.TwoFactorToken)
                || !_actionTokenService.VerifyToken(dto.TwoFactorToken, out var tokenUserId)
                || tokenUserId != user.Id)
            {
                throw new AppException("Unauthorized", StatusCodes.Status401Unauthorized, "A valid 2FA action token is required.");
            }
        }
        if (string.Equals(user.Email, dto.NewEmail, StringComparison.OrdinalIgnoreCase))
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "The new email is the same as the current one.");
        }

        var emailTaken = await _userManager.FindByEmailAsync(dto.NewEmail) is not null;

        if (emailTaken)
        {
            throw new AppException("Conflict", StatusCodes.Status409Conflict, "This email address is already in use.");
        }

        var token = _emailChangeTokenService.CreateToken(user.Id, dto.NewEmail, out var code);
        var (subject, body) = EmailResources.EmailChange(code);
        await _emailService.SendAsync(dto.NewEmail, subject, body);

        return Ok(new InitiateEmailChangeResDto(token));
    }

    /// <summary>
    /// Completes an email change.
    /// Confirms the email change using the token returned by InitiateEmailChange
    /// and the 6-digit code sent to the new address.
    /// </summary>
    [HttpPost("CompleteEmailChange")]
    public async Task<IActionResult> CompleteEmailChange([FromBody] CompleteEmailChangeReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!_emailChangeTokenService.VerifyToken(dto.Token, dto.Code, out var tokenUserId, out var newEmail))
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Invalid or expired code.");
        }
        if (tokenUserId != userId)
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(tokenUserId);

        if (user is null)
        {
            return Unauthorized();
        }

        // Generate Identity's change-email token so ChangeEmailAsync is satisfied,
        // then immediately apply it. The code above is the real verification gate.
        var identityToken = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
        var result = await _userManager.ChangeEmailAsync(user, newEmail, identityToken);

        if (!result.Succeeded)
        {
            throw new IdentityException(result);
        }

        return Ok();
    }

    // Email verification

    /// <summary>
    /// Starts the proccess of email verification.
    /// Sends to user's ser email a 6-digit code.
    /// </summary>
    [HttpPost("SendVerificationEmail")]
    public async Task<IActionResult> SendVerificationEmail()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (user.Email is null)
        {
            return BadRequest();
        }
        if (user.EmailConfirmed)
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Email is already verified.");
        }

        var code = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
        var (subject, body) = EmailResources.TwoFactorEmail(code);
        await _emailService.SendAsync(user.Email, subject, body);

        return Ok();
    }

    /// <summary>
    /// Ends the process of email verification.
    /// Verifies the email using the 6-digit code sent by SendVerificationEmail.
    /// </summary>
    [HttpPost("VerifyEmail")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (!await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider, dto.Code))
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Invalid or expired code.");
        }

        // Use Identity's confirmation flow to set EmailConfirmed = true
        var confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await _userManager.ConfirmEmailAsync(user, confirmToken);

        return Ok();
    }

    // Enable-disable two factors

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
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Incorrect code.");
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
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Incorrect code.");
        }

        user.TwoFactorMethod = TwoFactorMethod.None;

        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.UpdateAsync(user);
        await _userManager.ResetAuthenticatorKeyAsync(user);

        return Ok();
    }

    [HttpPost("EnableEmailTwoFactor")]
    public async Task<IActionResult> EnableEmailTwoFactor()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (!user.EmailConfirmed)
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "You must verify your email before enabling email two-factor authentication.");
        }
        if (user.TwoFactorEnabled)
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Two-factor authentication is already enabled.");
        }

        user.TwoFactorMethod = TwoFactorMethod.Email;

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        await _userManager.UpdateAsync(user);

        return Ok();
    }

    [HttpPost("DisableEmailTwoFactor")]
    public async Task<IActionResult> DisableEmailTwoFactor()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }
        if (!user.TwoFactorEnabled || user.TwoFactorMethod != TwoFactorMethod.Email)
        {
            throw new AppException("Bad Request", StatusCodes.Status400BadRequest, "Email two-factor authentication is not enabled.");
        }

        user.TwoFactorMethod = TwoFactorMethod.None;

        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.UpdateAsync(user);

        return Ok();
    }
}
