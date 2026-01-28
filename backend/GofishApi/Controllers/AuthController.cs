using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GofishApi.Dtos;
using GofishApi.Models;
using GofishApi.Services;

namespace GofishApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly UserManager<AppUser> _userManager;
        private readonly IJwtService _jwtService;
        private readonly ITwoFactorTokenService _twoFactorService;

        public AuthController(
            ILogger<AuthController> logger,
            UserManager<AppUser> userManager,
            IJwtService jwtService,
            ITwoFactorTokenService twoFactorService
        )
        {
            _logger = logger;
            _userManager = userManager;
            _jwtService = jwtService;
            _twoFactorService = twoFactorService;
        }

        [HttpPost("SignUp")]
        public async Task<IActionResult> SignUp([FromBody] SignUpReqDTO dto)
        {
            var user = new AppUser
            {
                Email = dto.Email,
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (result.Succeeded)
            {
                return Ok(new SignUpResDTO(
                    Success: true
                ));
            }
            else
            {
                return BadRequest(new SignUpResDTO(
                    Success: false,
                    Errors: result.Errors
                ));
            }
        }

        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn([FromBody] SignInReqDTO dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Email)
                    ?? await _userManager.FindByEmailAsync(dto.Email);

            if (user is null)
            {
                return NotFound(new SignInResDTO(
                    Success: false,
                    ErrorCode: "NoSuchUser",
                    ErrorDescription: "No user was found with the provided email or username."
                ));
            }
            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return BadRequest(new SignInResDTO(
                    Success: false,
                    ErrorCode: "InvalidCredentials",
                    ErrorDescription: "Email/username or password is incorrect."
                ));
            }
            if (user.TwoFactorEnabled)
            {
                var hasAuthenticator = await _userManager.GetAuthenticatorKeyAsync(user) is { Length: > 0 };
                if (hasAuthenticator)
                {
                    var twoFactorToken = _twoFactorService.CreateTwoFactorToken(user);
                    return Ok(new SignInResDTO(
                        Success: true,
                        RequiresTwoFactor: true,
                        TwoFactorToken: twoFactorToken
                    ));
                }
            }

            var token = await _jwtService.CreateTokenAsync(user);
            return Ok(new SignInResDTO(
                Success: true,
                Token: token
            ));
        }
    }
}
