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

namespace GofishApi.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
public class UserProfileController : ControllerBase
{
    private readonly ILogger<UserProfileController> _logger;
    private readonly IBlobStorageService _blobStorage;
    private readonly AppDbContext _context;

    public UserProfileController(
        ILogger<UserProfileController> logger,
        IBlobStorageService blobStorage,
        AppDbContext context
    ){
        _logger = logger;
        _blobStorage = blobStorage;
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserProfile(string id)
    {
        var userProfile = await _context.UserProfiles.FindAsync(id);
        if (userProfile is null) return NotFound();
        return Ok(GetUserProfileResDto.FromEntity(userProfile));
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
