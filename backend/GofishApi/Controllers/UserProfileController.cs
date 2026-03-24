using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GofishApi.Data;
using GofishApi.Models;
using GofishApi.Services;
using GofishApi.Dtos;
using GofishApi.Extensions;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]/[action]")]
[ApiController]
public class UserProfileController : ControllerBase
{
    private readonly ILogger<UserProfileController> _logger;
    private readonly IBlobStorageService _blobStorage;
    private readonly AppDbContext _context;
    private readonly UserManager<AppUser> _userManager;

    public UserProfileController(
        ILogger<UserProfileController> logger,
        IBlobStorageService blobStorage,
        AppDbContext context,
        UserManager<AppUser> userManager
    )
    {
        _logger = logger;
        _blobStorage = blobStorage;
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserProfile(string id)
    {
        var userProfile = await _context.UserProfiles
            .Include(p => p.AppUser)
            .FirstOrDefaultAsync(p => p.UserId == id);
        if (userProfile is null) return NotFound();
        return Ok(GetUserProfileResDto.FromEntity(userProfile));
    }

    [HttpGet]
    public async Task<IActionResult> GetUserProfileSettings()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (userProfile is null) return NotFound();
        return Ok(GetUserProfileSettingsResDto.FromEntity(userProfile));
    }

    [HttpPut]
    public async Task<IActionResult> PutUserProfile([FromBody] PutUserProfileReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile is null) return NotFound();

        userProfile.Bio = dto.Bio;
        userProfile.AvatarUrl = dto.AvatarUrl;
        userProfile.LastUpdateAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.UserProfiles.Any(e => e.UserId == userId))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpPatch]
    public async Task<IActionResult> PatchUserProfile([FromBody] PatchUserProfileReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile is null) return NotFound();

        userProfile.Bio = dto.Bio ?? userProfile.Bio;
        userProfile.AvatarUrl = dto.AvatarUrl ?? userProfile.AvatarUrl;
        userProfile.LastUpdateAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.UserProfiles.Any(e => e.UserId == userId))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }
}
