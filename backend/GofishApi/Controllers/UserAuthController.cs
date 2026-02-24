using GofishApi.Dtos;
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
public class UserAuthController : ControllerBase
{
    private readonly ILogger<UserAuthController> _logger;
    private readonly UserManager<AppUser> _userManager;

    public UserAuthController(
        ILogger<UserAuthController> logger,
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
            return NotFound(new ApiErrorResponse
            {
                Errors = [new("UserNotFound", "Id returned no results")]
            });
        }

        var authenticatorKey = await _userManager.GetAuthenticatorKeyAsync(user!);

        return Ok(new ApiResponse<SecurityInfoResDTO>
        {
            Data = new(user!.TwoFactorEnabled, authenticatorKey is { Length: > 0 })
        });
    }

    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (dto.CurrentPassword == dto.NewPassword)
        {
            return BadRequest(new ApiErrorResponse
            {
                Errors = [new("EqualPasswords", "New password equals current password")]
            });
        }
        if (user is null)
        {
            return NotFound(new ApiErrorResponse
            {
                Errors = [new("UserNotFound", "Id returned no results")]
            });
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (result.Succeeded is false)
        {
            return BadRequest(new ApiErrorResponse
            {
                Errors = result.Errors
                               .Select(e => new ApiError(e.Code, e.Description))
                               .ToList()
            });
        }

        return Ok(new ApiResponse<object>());
    }
}
