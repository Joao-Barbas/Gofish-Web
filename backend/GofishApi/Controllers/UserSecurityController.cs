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

/// <summary>
/// Controlador responsável pela gestão de segurança da conta do utilizador,
/// incluindo password, verificação de email, mudança de email e autenticação de dois fatores.
/// </summary>
[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UserSecurityController : ControllerBase
{
    /// <summary>Gestor de utilizadores do ASP.NET Identity.</summary>
    private readonly UserManager<AppUser> _userManager;

    /// <summary>Serviço de envio de emails.</summary>
    private readonly IEmailService _emailService;

    /// <summary>Serviço de criação e validação de tokens temporários para ações sensíveis.</summary>
    private readonly ISensitiveActionTokenService _actionTokenService;

    /// <summary>Serviço de criação e validação de tokens temporários para mudança de email.</summary>
    private readonly IEmailChangeTokenService _emailChangeTokenService;

    /// <summary>
    /// Inicializa uma nova instância do controlador de segurança do utilizador.
    /// </summary>
    /// <param name="userManager">Gestor de utilizadores.</param>
    /// <param name="emailService">Serviço de envio de emails.</param>
    /// <param name="actionTokenService">Serviço de tokens para ações sensíveis.</param>
    /// <param name="emailChangeTokenService">Serviço de tokens para mudança de email.</param>
    public UserSecurityController(
        UserManager<AppUser> userManager,
        IEmailService emailService,
        ISensitiveActionTokenService actionTokenService,
        IEmailChangeTokenService emailChangeTokenService
    )
    {
        _userManager = userManager;
        _emailService = emailService;
        _actionTokenService = actionTokenService;
        _emailChangeTokenService = emailChangeTokenService;
    }

    /// <summary>
    /// Obtém informação de segurança da conta do utilizador autenticado,
    /// incluindo provider de autenticação, estado de 2FA e verificação de email.
    /// </summary>
    /// <returns>Informação de segurança da conta.</returns>
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
    /// Valida o código de autenticação de dois fatores ativo do utilizador
    /// e devolve um token temporário para ações sensíveis.
    /// </summary>
    /// <param name="dto">Código de autenticação de dois fatores.</param>
    /// <returns>Token temporário para ações sensíveis.</returns>
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

    /// <summary>
    /// Altera a password do utilizador autenticado.
    /// Se a autenticação de dois fatores estiver ativa, exige também um código 2FA válido.
    /// </summary>
    /// <param name="dto">Password atual, nova password e eventual código 2FA.</param>
    /// <returns>Resposta de sucesso.</returns>
    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

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

    /// <summary>
    /// Envia por email um código 2FA quando o método preferido de autenticação
    /// de dois fatores do utilizador é email.
    /// </summary>
    /// <returns>Resposta de sucesso.</returns>
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

    /// <summary>
    /// Inicia o processo de recuperação de password.
    /// Envia para o email do utilizador um código/token de reset.
    /// </summary>
    /// <param name="dto">Email do utilizador.</param>
    /// <returns>Resposta de sucesso, sem revelar se o utilizador existe.</returns>
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

        return Ok();
    }

    /// <summary>
    /// Conclui o processo de recuperação de password,
    /// redefinindo a password com base no código/token recebido.
    /// </summary>
    /// <param name="dto">Email, código/token e nova password.</param>
    /// <returns>Resposta de sucesso.</returns>
    [AllowAnonymous]
    [HttpPost("ResetPassword")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordReqDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user is null || !(await _userManager.IsEmailConfirmedAsync(user)))
        {
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

    /// <summary>
    /// Inicia o processo de mudança de email.
    /// Envia um código para o novo email e devolve um token temporário de confirmação.
    /// </summary>
    /// <param name="dto">Novo email e eventual token de ação sensível.</param>
    /// <returns>Token temporário para conclusão da mudança de email.</returns>
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
    /// Conclui a mudança de email validando o token temporário e o código enviado
    /// para o novo endereço de email.
    /// </summary>
    /// <param name="dto">Token de mudança de email e código recebido.</param>
    /// <returns>Resposta de sucesso.</returns>
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

        var identityToken = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
        var result = await _userManager.ChangeEmailAsync(user, newEmail, identityToken);

        if (!result.Succeeded)
        {
            throw new IdentityException(result);
        }

        return Ok();
    }

    /// <summary>
    /// Inicia o processo de verificação do email atual do utilizador,
    /// enviando um código para esse endereço.
    /// </summary>
    /// <returns>Resposta de sucesso.</returns>
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
    /// Conclui o processo de verificação do email do utilizador
    /// usando o código enviado previamente.
    /// </summary>
    /// <param name="dto">Código de verificação do email.</param>
    /// <returns>Resposta de sucesso.</returns>
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

        var confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await _userManager.ConfirmEmailAsync(user, confirmToken);

        return Ok();
    }

    /// <summary>
    /// Obtém a configuração necessária para ativação de TOTP,
    /// incluindo chave secreta e URI de provisioning.
    /// </summary>
    /// <returns>Chave TOTP e URI de configuração.</returns>
    [HttpGet("GetTotpSetup")]
    public async Task<IActionResult> GetTotpSetup()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

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
        var uri = $"otpauth://totp/{label}?secret={key}&issuer=GOFISH";

        return Ok(new GetTotpSetupResDTO(key!, uri));
    }

    /// <summary>
    /// Ativa autenticação de dois fatores por TOTP após validação do código gerado.
    /// Também gera códigos de recuperação.
    /// </summary>
    /// <param name="dto">Código TOTP de validação.</param>
    /// <returns>Códigos de recuperação gerados.</returns>
    [HttpPost("EnableTotp")]
    public async Task<IActionResult> EnableTotp([FromBody] EnableTotpReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

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

    /// <summary>
    /// Desativa autenticação de dois fatores por TOTP após validação do código atual.
    /// </summary>
    /// <param name="dto">Código TOTP de validação.</param>
    /// <returns>Resposta de sucesso.</returns>
    [HttpPost("DisableTotp")]
    public async Task<IActionResult> DisableTotp([FromBody] DisableTotpReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

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

    /// <summary>
    /// Ativa autenticação de dois fatores por email.
    /// Requer que o email do utilizador esteja previamente verificado.
    /// </summary>
    /// <returns>Resposta de sucesso.</returns>
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

    /// <summary>
    /// Desativa autenticação de dois fatores por email.
    /// </summary>
    /// <returns>Resposta de sucesso.</returns>
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