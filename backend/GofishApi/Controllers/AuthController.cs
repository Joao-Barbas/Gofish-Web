using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GofishApi.Builders;
using GofishApi.Exceptions;
using GofishApi.Dtos;
using GofishApi.Models;
using GofishApi.Services;
using GofishApi.Enums;
using System.Security.Claims;

namespace GofishApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IJwtService _jwtService;
    private readonly ITwoFactorTokenService _twoFactorService;
    private readonly IAppUserBuilder _userBuilder;
    private readonly IConfiguration _configuration;

    public AuthController(
        ILogger<AuthController> logger,
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IJwtService jwtService,
        ITwoFactorTokenService twoFactorService,
        IAppUserBuilder userBuilder,
        IConfiguration configuration
    )
    {
        _logger = logger;
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _twoFactorService = twoFactorService;
        _userBuilder = userBuilder;
        _configuration = configuration;
    }

    [HttpPost("SignUp")]
    public async Task<IActionResult> SignUp([FromBody] SignUpReqDTO dto)
    {
        var user = await _userBuilder
            .FromDto(dto)
            .CreateAsync();

        var token = await _jwtService.CreateTokenAsync(user);
        return StatusCode(StatusCodes.Status201Created, new SignInResDTO(token));
    }

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
        if (user.TwoFactorEnabled)
        {
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
        if (!await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.TwoFactorCode))
        {
            throw new AppException("Bad Request", "Incorrect code.", StatusCodes.Status400BadRequest);
        }

        var token = await _jwtService.CreateTokenAsync(user);
        return Ok(new SignInResDTO(token));
    }

    [HttpGet("ExternalLogin")]
    public IActionResult ExternalLogin(string provider)
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth");
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return Challenge(properties, provider);
    }

    [HttpGet("ExternalLoginCallback")]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        var angularUrl = _configuration["AppUrl"]!;
        var info = await _signInManager.GetExternalLoginInfoAsync();

        if (info == null)
            return Redirect($"{angularUrl}/signin?error=external-login-failed");

        var email = info.Principal.FindFirstValue(ClaimTypes.Email)!;

        // Check if this Google account is already linked
        var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

        if (user == null)
        {
            // Check if an email/password account already exists
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                return Redirect($"{angularUrl}/signin?error=account-exists");

            var firstName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty;
            var lastName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? string.Empty;
            var userName = email.Split('@')[0];

            if (await _userManager.FindByNameAsync(userName) != null)
                userName = $"{userName}_{Guid.NewGuid().ToString()[..4]}";

            var newUser = new AppUser
            {
                Email = email,
                UserName = userName,
                FirstName = firstName,
                LastName = lastName,
                EmailConfirmed = true,
                TwoFactorMethod = TwoFactorMethod.None
            };

            user = await _userBuilder.FromExternalLogin(newUser, info).CreateAsync();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _jwtService.CreateTokenAsync(user, roles);

        return Redirect($"{angularUrl}/auth/callback?token={Uri.EscapeDataString(token)}");
    }


    // [Authorize(Roles = "Admin")]
    // private static string AdminOnly()
    // { return "Admin Only"; }
}
