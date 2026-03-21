using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Group = GofishApi.Models.Group;

namespace GofishApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GroupController : ControllerBase
{
    private readonly ILogger<PostController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IBlobStorageService _blobStorage;

    public GroupController(
        ILogger<PostController> logger,
        AppDbContext db,
        UserManager<AppUser> userManager,
        IBlobStorageService blobStorage
    )
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
        _blobStorage = blobStorage;
    }

    [Authorize]
    [HttpPost("GetGroup")]
    public async Task<IActionResult> GetGroup([FromBody] GetGroupReqDTO dto)
    {
        // TODO: Visibility level is not being accounted for yet

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var query = _db.Groups.AsQueryable();

        if (dto.DataRequest?.IncludeMembers ?? true)
        {
            query = query
                .Include(g => g.GroupUsers)
                    .ThenInclude(gu => gu.AppUser)
                        .ThenInclude(u => u.UserProfile);
        }

        if (dto.DataRequest?.IncludePosts ?? true)
        {
            query = query
                .Include(g => g.Posts)
                    .ThenInclude(p => p.Pin)
                .Include(g => g.Posts)
                    .ThenInclude(p => p.PostVotes);
        }
        var group = await query.FirstOrDefaultAsync(g => g.Id == dto.GroupId);

        if (group is null)
        {
            return NotFound();
        }

        var data = GetGroupDTO.FromGroup(group, dto.DataRequest);
        return Ok(new GetGroupResDTO(data));
    }

    [Authorize]
    [HttpPost("CreateGroup")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> CreateGroup([FromForm] CreateGroupReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var allowedTypes = new[] { "image/jpeg", "image/png" };
        string imageUrl;
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        if (!allowedTypes.Contains(dto.Image.ContentType)) throw new AppException("Bad Request", "Invalid file type.", StatusCodes.Status400BadRequest);

        var normalizedName = dto.Name.Trim().ToUpper();
        var exists = await _db.Groups.AnyAsync(g => g.NormalizedName == normalizedName);
        if (exists) return BadRequest("Já existe um grupo com esse nome.");

        try
        {
            imageUrl = await _blobStorage.UploadImageAsync(dto.Image);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during image upload to blob storage");
            throw new AppException("Service Unavailable", "Image upload failed.", StatusCodes.Status503ServiceUnavailable);
        }

        var newGroup = new Group
        {
            Name = dto.Name.Trim(),
            NormalizedName = normalizedName,
            Description = dto.Description?.Trim() ?? string.Empty,
            AvatarUrl = imageUrl,
            CreatedAt = DateTime.UtcNow,
        };

        try
        {
            _db.Groups.Add(newGroup);
            await _db.SaveChangesAsync();

            var groupUser = new GroupUser
            {
                GroupId = newGroup.Id,
                UserId = user.Id,
                RoleId = "1"
            };

            _db.GroupUsers.Add(groupUser);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while saving group");
            throw new AppException(
                "Service Unavailable",
                $"Unable to save this group: {ex.InnerException?.Message ?? ex.Message}",
                StatusCodes.Status503ServiceUnavailable
            );
        }

        return Ok(new CreateGroupResDTO(newGroup.Id));
    }

    #region ManageMembers

        /*
    [Authorize]
    [HttpPost("SendInvite/{groupId}")]
    public async Task<IActionResult> SendInvite(int groupId, [FromBody] SendGroupInviteReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var group = await _db.Groups.FirstOrDefaultAsync(g => g.Id == groupId);
        if (group is null) return NotFound();

        var requesterMembership = await _db.GroupUsers
       .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == requesterUserId);
    }
        */

    #endregion
}