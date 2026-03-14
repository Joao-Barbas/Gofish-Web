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

namespace GofishApi.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
public class UserProfileController : ControllerBase
{
    private readonly ILogger<UserProfileController> _logger;
    private readonly IBlobStorageService _blobStorage;
    private readonly IValidationProblemService _problemService;
    private readonly AppDbContext _context;

    public UserProfileController(
        ILogger<UserProfileController> logger,
        IBlobStorageService blobStorage,
        IValidationProblemService problemService,
        AppDbContext context
    ){
        _logger = logger;
        _blobStorage = blobStorage;
        _problemService = problemService;
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserProfile(string id)
    {
        var userProfile = await _context.UserProfiles.FindAsync(id);
        if (userProfile is null) return NotFound();
        return Ok(GetUserProfileResDTO.FromEntity(userProfile));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutUserProfile(string id, [FromBody] PutUserProfileReqDTO dto)
    {
        var userProfile = await _context.UserProfiles.FindAsync(id);

        if (userProfile is null)
        {
            return NotFound();
        }

        userProfile.Bio = dto.Bio;
        userProfile.AvatarUrl = dto.AvatarUrl;
        userProfile.LastUpdateAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.UserProfiles.Any(e => e.UserId == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchUserProfile(string id, [FromBody] PatchUserProfileReqDTO dto)
    {
        var userProfile = await _context.UserProfiles.FindAsync(id);

        if (userProfile == null)
        {
            return NotFound();
        }

        userProfile.Bio = dto.Bio ?? userProfile.Bio;
        userProfile.AvatarUrl = dto.AvatarUrl ?? userProfile.AvatarUrl;
        userProfile.LastUpdateAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.UserProfiles.Any(e => e.UserId == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }
}
