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
using GofishApi.Exceptions;
using GofishApi.Enums;

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
    private readonly IVisibilityService _visibility;
    private readonly IGamificationService _gamification;

    public UserProfileController(
        ILogger<UserProfileController> logger,
        IBlobStorageService blobStorage,
        AppDbContext context,
        UserManager<AppUser> userManager,
        IVisibilityService visibility,
        IGamificationService gamification
    )
    {
        _logger = logger;
        _blobStorage = blobStorage;
        _context = context;
        _userManager = userManager;
        _visibility = visibility;
        _gamification = gamification;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserProfile(string id)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var thisUserProfile = await _context.UserProfiles
        .Include(p => p.AppUser)
        .FirstOrDefaultAsync(p => p.UserId == id);

        if (thisUserProfile is null)
        {
            return NotFound();
        }

        var pinCount = await _visibility
        .FilterVisiblePins(_context.Pins.Where(p => p.UserId == id), authUserId)
        .CountAsync();

        var friendCount = await _context.Friendships
        .CountAsync(f => (f.RequesterUserId == id || f.ReceiverUserId == id) && f.State == FriendshipState.Accepted);

        var groupCount = await _context.GroupUsers
        .CountAsync(gu => gu.UserId == id);

        var friendship = await _context.Friendships
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .FirstOrDefaultAsync(f =>
            (f.RequesterUserId == authUserId && f.ReceiverUserId == id) ||
            (f.RequesterUserId == id && f.ReceiverUserId == authUserId));

        var data = new UserProfileDto
        {
            UserId = thisUserProfile.UserId,
            DisplayName = thisUserProfile.AppUser.DisplayName,
            UserName = thisUserProfile.AppUser.UserName ?? "",
            CatchPoints = thisUserProfile.CatchPoints,
            Rank = GamificationService.GetRank(thisUserProfile.CatchPoints),
            Bio = thisUserProfile.Bio,
            AvatarUrl = thisUserProfile.AvatarUrl,
            JoinedAt = thisUserProfile.JoinedAt,
            LastActiveAt = thisUserProfile.LastActiveAt,
            Friendship = friendship is not null ? FriendshipDto.FromEntity(friendship) : null,
            WeeklyStreak = thisUserProfile.WeeklyStreak,
            MaxWeeklySteak = thisUserProfile.MaxWeeklyStreak,
            PinsCount = pinCount,
            FriendsCount = friendCount,
            GroupsCount = groupCount
        };

        return Ok(data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserPoints(string id)
    {
        var points = await _gamification.TryGetPoints(id);
        if (points is not int value)
        {
            return NotFound();
        }
        return Ok(new GetUserPointsResDto { Points = value });
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
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> PutUserProfile([FromForm] PutUserProfileReqDto dto)
    {
        var allowedTypes = new[] { "image/jpeg", "image/png" };

        if (!allowedTypes.Contains(dto.Avatar.ContentType))
        {
            throw new AppValidationException("InvalidFileType", "Allowed file type only include JPEG and PNG.");
        }

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var userProfile = await _context.UserProfiles.FindAsync(userId);

        if (userProfile is null)
        {
            return NotFound();
        }
        if (userProfile.AvatarUrl is not null)
        {
            await _blobStorage.DeleteImageAsync(userProfile.AvatarUrl);
        }

        userProfile.Bio = dto.Bio;
        userProfile.AvatarUrl = await _blobStorage.UploadUserAvatarAsync(dto.Avatar);
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
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> PatchUserProfile([FromForm] PatchUserProfileReqDto dto)
    {
        var allowedTypes = new[] { "image/jpeg", "image/png" };

        if (dto.Avatar is not null && !allowedTypes.Contains(dto.Avatar.ContentType))
        {
            throw new AppValidationException("InvalidFileType", "Allowed file type only include JPEG and PNG.");
        }

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var userProfile = await _context.UserProfiles.FindAsync(userId);

        if (userProfile is null)
        {
            return NotFound();
        }

        if (dto.Bio is not null)
        {
            userProfile.Bio = dto.Bio;
        }
        if (dto.Avatar is not null)
        {
            if (userProfile.AvatarUrl is not null)
            {
                await _blobStorage.DeleteImageAsync(userProfile.AvatarUrl);
            }
            userProfile.AvatarUrl = await _blobStorage.UploadUserAvatarAsync(dto.Avatar);
        }

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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserAvatar([FromRoute] string id)
    {
        var profile = await _context.UserProfiles.FindAsync(id);
        if (profile is null) return NotFound();
        return Ok(profile.AvatarUrl);
    }
}
