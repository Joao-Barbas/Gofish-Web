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
        if (user is null) throw new UnauthorizedException();
        return Ok(new SecurityInfoResDTO(user.TwoFactorEnabled, user.TwoFactorMethod));
    }

    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            throw new UnauthorizedException();
        }
        if (dto.CurrentPassword == dto.NewPassword)
        {
            throw new Exceptions.ApplicationException("Attempted password change with existing password", StatusCodes.Status400BadRequest, [
                new("SamePassword", "Your new password must be different from your current password")
            ]);
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
        {
            throw new IdentityException(result.Errors);
        }

        return Ok();
    }
}
