using GofishApi.Builders;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Controlador responsável pela autenticação de utilizadores.
/// Inclui registo, login, autenticação de dois fatores e login externo.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    /// <summary>Logger para registo de eventos.</summary>
    private readonly ILogger<AuthController> _logger;

    /// <summary>Gestor de utilizadores do Identity.</summary>
    private readonly UserManager<AppUser> _userManager;

    /// <summary>Gestor de autenticação (login/logout).</summary>
    private readonly SignInManager<AppUser> _signInManager;

    /// <summary>Serviço responsável por gerar JWT.</summary>
    private readonly IJwtService _jwtService;

    /// <summary>Serviço para geração e validação de tokens de 2FA.</summary>
    private readonly ITwoFactorTokenService _twoFactorService;

    /// <summary>Builder para criação de utilizadores.</summary>
    private readonly IAppUserBuilder _userBuilder;

    /// <summary>Configuração da aplicação.</summary>
    private readonly IConfiguration _configuration;

    /// <summary>Serviço de envio de emails.</summary>
    private readonly IEmailService _emailService;

    /// <summary>
    /// Construtor do controlador de autenticação.
    /// </summary>
    public AuthController(
        ILogger<AuthController> logger,
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IJwtService jwtService,
        ITwoFactorTokenService twoFactorService,
        IAppUserBuilder userBuilder,
        IConfiguration configuration,
        IEmailService emailService
    )
    {
        _logger = logger;
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _twoFactorService = twoFactorService;
        _userBuilder = userBuilder;
        _configuration = configuration;
        _emailService = emailService;
    }

    /// <summary>
    /// Regista um novo utilizador.
    /// </summary>
    /// <param name="dto">Dados de registo.</param>
    /// <returns>JWT após criação do utilizador.</returns>
    [HttpPost("SignUp")]
    public async Task<IActionResult> SignUp([FromBody] SignUpReqDTO dto)
    {
        var user = await _userBuilder
            .FromDto(dto)
            .CreateAsync();

        var token = await _jwtService.CreateTokenAsync(user);
        return StatusCode(StatusCodes.Status201Created, new SignInResDTO(token));
    }

    /// <summary>
    /// Autentica um utilizador com username/email e password.
    /// Pode ativar fluxo de 2FA.
    /// </summary>
    /// <param name="dto">Credenciais de login.</param>
    /// <returns>JWT ou token intermédio de 2FA.</returns>
    [HttpPost("SignIn")]
    public async Task<IActionResult> SignIn([FromBody] SignInReqDTO dto)
    {
        var user = await _userManager.FindByNameAsync(dto.EmailOrUserName)
                ?? await _userManager.FindByEmailAsync(dto.EmailOrUserName);

        if (user is null)
        {
            return Unauthorized();
        }

        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            return Unauthorized();
        }

        // Fluxo de autenticação com 2FA
        if (user.TwoFactorEnabled)
        {
            if (user.TwoFactorMethod == TwoFactorMethod.Email)
            {
                var code = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
                var (subject, body) = EmailResources.TwoFactorSignIn(code);

                await _emailService.SendAsync(user.Email!, subject, body);

                var twoFactorToken = _twoFactorService.CreateTwoFactorToken(user);
                return Ok(new SignInResDTO(null, true, twoFactorToken));
            }

            var hasAuthenticator = await _userManager.GetAuthenticatorKeyAsync(user) is { Length: > 0 };

            if (hasAuthenticator)
            {
                var twoFactorToken = _twoFactorService.CreateTwoFactorToken(user);
                return Ok(new SignInResDTO(null, true, twoFactorToken));
            }
        }

        var token = await _jwtService.CreateTokenAsync(user);
        return Ok(new SignInResDTO(token));
    }

    /// <summary>
    /// Valida o código de autenticação de dois fatores.
    /// </summary>
    /// <param name="dto">Token intermédio e código 2FA.</param>
    /// <returns>JWT após validação.</returns>
    [HttpPost("TwoFactorSignIn")]
    public async Task<IActionResult> TwoFactorSignIn([FromBody] TwoFactorSignInReqDTO dto)
    {
        if (!_twoFactorService.VerifyTwoFactorToken(dto.TwoFactorToken, out var userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
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

        var token = await _jwtService.CreateTokenAsync(user);
        return Ok(new SignInResDTO(token));
    }

    /// <summary>
    /// Inicia autenticação externa (Google, Facebook, etc).
    /// </summary>
    /// <param name="provider">Nome do provider externo.</param>
    /// <returns>Redirect para o provider.</returns>
    [HttpGet("ExternalLogin")]
    public IActionResult ExternalLogin(string provider)
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth");
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);

        return Challenge(properties, provider);
    }

    /// <summary>
    /// Callback após autenticação externa.
    /// Cria utilizador caso não exista.
    /// </summary>
    /// <returns>Redirect com JWT.</returns>
    [HttpGet("ExternalLoginCallback")]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        var url = _configuration["AppUrl"]!;
        var info = await _signInManager.GetExternalLoginInfoAsync();

        if (info is null)
        {
            return Redirect($"{url}/signin?error=external-login-failed");
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email)!;
        var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

        // Novo utilizador via login externo
        if (user is null)
        {
            if (await _userManager.FindByEmailAsync(email) is not null)
            {
                return Redirect($"{url}/signin?error=account-exists");
            }

            var firstName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty;
            var lastName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? string.Empty;
            var userName = email.Split('@')[0];

            if (await _userManager.FindByNameAsync(userName) is not null)
            {
                userName = $"{userName}_{Guid.NewGuid().ToString()[..4]}";
            }

            var newUser = new AppUser
            {
                Email = email,
                UserName = userName,
                FirstName = firstName,
                LastName = lastName,
                DisplayName = $"{firstName} {lastName}".Trim(),
                EmailConfirmed = true,
                TwoFactorMethod = TwoFactorMethod.None
            };

            user = await _userBuilder.FromExternalLogin(newUser, info).CreateAsync();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _jwtService.CreateTokenAsync(user, roles);

        return Redirect($"{url}/auth/callback?token={Uri.EscapeDataString(token)}");
    }
}