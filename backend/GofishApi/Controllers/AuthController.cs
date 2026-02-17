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
                return Ok(new ApiResponse<object>());
            }
            else
            {
                return BadRequest(new ApiErrorResponse
                {
                    Errors = [.. result.Errors.Select(e => new ApiError(e.Code, e.Description))]
                });
            }
        }

        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn([FromBody] SignInReqDTO dto)
        {
            var user = await _userManager.FindByNameAsync(dto.EmailOrUserName)
                    ?? await _userManager.FindByEmailAsync(dto.EmailOrUserName);

            if (user is null)
            {
                return NotFound(new ApiErrorResponse
                {
                    Errors = [new("NoSuchUser", "Email or username returned no results")]
                });
            }
            if (!await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return BadRequest(new ApiErrorResponse
                {
                    Errors = [new("InvalidCredentials", "Email/username or password is incorrect")]
                });
            }
            if (user.TwoFactorEnabled)
            {
                var hasAuthenticator = await _userManager.GetAuthenticatorKeyAsync(user) is { Length: > 0 };
                if (hasAuthenticator)
                {
                    var twoFactorToken = _twoFactorService.CreateTwoFactorToken(user);
                    return Ok(new ApiResponse<SignInResDTO>
                    {
                        Data = new(null, true, twoFactorToken)
                    });
                }
            }

            var token = await _jwtService.CreateTokenAsync(user);
            return Ok(new ApiResponse<SignInResDTO>
            {
                Data = new(token)
            });
        }
    }
}
