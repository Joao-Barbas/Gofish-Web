using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GofishApi.Builders;
using GofishApi.Exceptions;
using GofishApi.Dtos;
using GofishApi.Models;
using GofishApi.Services;

namespace GofishApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtService _jwtService;
    private readonly ITwoFactorTokenService _twoFactorService;
    private readonly IAppUserBuilder _userBuilder;

    public AuthController(
        ILogger<AuthController> logger,
        UserManager<AppUser> userManager,
        IJwtService jwtService,
        ITwoFactorTokenService twoFactorService,
        IAppUserBuilder userBuilder
    )
    {
        _logger = logger;
        _userManager = userManager;
        _jwtService = jwtService;
        _twoFactorService = twoFactorService;
        _userBuilder = userBuilder;
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

    // [Authorize(Roles = "Admin")]
    // private static string AdminOnly()
    // { return "Admin Only"; }
}
