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

        public AuthController(
            ILogger<AuthController> logger,
            UserManager<AppUser> userManager,
            IJwtService jwtService
        ){
            _logger = logger;
            _userManager = userManager;
            _jwtService = jwtService;
        }

        [HttpPost("SignUp")]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDTO dto)
        {
            var user = new AppUser
            {
                Email = dto.Email,
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (result.Succeeded) return Ok(result);
            return BadRequest(result);
        }

        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn([FromBody] UserSignInDTO dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Email) ?? await _userManager.FindByEmailAsync(dto.Email);
            if (user is null) return BadRequest(new { message = "Username/e-mail or password is/are incorrect." });
            var ok = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!ok) return BadRequest(new { message = "Username/e-mail or password is/are incorrect." });
            var token = await _jwtService.CreateTokenAsync(user);
            return Ok(new { token });
        }
    }
}
