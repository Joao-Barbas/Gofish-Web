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

[Authorize]
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
                        .ThenInclude(u => u.UserProfile)
                .Include(g => g.GroupUsers);
                    // .ThenInclude(gu => gu.Role);
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
                Role = GroupRole.Owner
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

    [Authorize]
    [HttpDelete("DeleteGroup/{groupId}")]
    public async Task<IActionResult> DeleteGroup([FromRoute] int groupId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var group = await _db.Groups
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group is null)
            return NotFound("Group not found.");

        var membership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);

        if (membership is null || membership.Role != GroupRole.Owner)
            return Forbid();

        try
        {
            var memberships = await _db.GroupUsers
                .Where(gu => gu.GroupId == groupId)
                .ToListAsync();

            var invites = await _db.GroupInvites
                .Where(gi => gi.GroupId == groupId)
                .ToListAsync();

            var groupPosts = await _db.GroupPosts
                .Where(gp => gp.GroupId == groupId)
                .ToListAsync();

            var postIds = groupPosts
                .Select(gp => gp.PostId)
                .Distinct()
                .ToList();

            var posts = await _db.Posts
                .Include(p => p.Pin)
                .Where(p => postIds.Contains(p.Id))
                .ToListAsync();

            foreach (var post in posts)
            {
                var groupCount = await _db.GroupPosts
                    .CountAsync(gp => gp.PostId == post.Id);

                if (groupCount == 1)
                {
                    post.Pin.Visibility = VisibilityLevel.Private;
                }
            }

            _db.GroupUsers.RemoveRange(memberships);
            _db.GroupInvites.RemoveRange(invites);
            _db.GroupPosts.RemoveRange(groupPosts);
            _db.Groups.Remove(group);

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting group {GroupId}", groupId);
            throw new AppException(
                "Service Unavailable",
                $"Unable to delete this group: {ex.InnerException?.Message ?? ex.Message}",
                StatusCodes.Status503ServiceUnavailable
            );
        }

        return NoContent();
    }

    [Authorize]
    [HttpGet("GetUserGroups")]
    public async Task<IActionResult> GetUserGroups()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null)
            return Unauthorized();

        var groups = await _db.Groups
            .Where(g => g.GroupUsers.Any(gu => gu.UserId == userId))
            .Include(g => g.GroupUsers)
                .ThenInclude(gu => gu.AppUser)
                    .ThenInclude(u => u.UserProfile)
            .Include(g => g.Posts)
                .ThenInclude(p => p.Pin)
            .Include(g => g.Posts)
                .ThenInclude(p => p.PostVotes)
            .ToListAsync();

        var data = groups
            .Select(g => GetGroupDTO.FromGroup(
                g,
                new GroupDataRequestDTO(
                    IncludePosts: false,
                    IncludeMembers: false
                )
            ))
            .ToList();

        return Ok(new GetUserGroupsResDTO(data));
    }

    #region ManageMembers

    [Authorize]
    [HttpPost("SendInvite/{groupId}")]
    public async Task<IActionResult> SendInvite(int groupId, [FromBody] SendGroupInviteReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        if (dto.ReceiverUserId == userId)
            return BadRequest("You cannot invite yourself.");

        var group = await _db.Groups.FirstOrDefaultAsync(g => g.Id == groupId);
        if (group is null) return NotFound();

        var isAllowed = await _db.GroupUsers.AnyAsync(gu =>
            gu.GroupId == groupId &&
            gu.UserId == userId &&
            (gu.Role == GroupRole.Owner || gu.Role == GroupRole.Moderator));

        if (!isAllowed)
            return Forbid();

        var receiverExists = await _userManager.FindByIdAsync(dto.ReceiverUserId);
        if (receiverExists is null)
            return BadRequest("Receiver user does not exist.");

        var alreadyMember = await _db.GroupUsers.AnyAsync(gu =>
            gu.GroupId == groupId &&
            gu.UserId == dto.ReceiverUserId);

        if (alreadyMember)
            return BadRequest("This user is already a member of the group.");

        var pendingInviteExists = await _db.GroupInvites.AnyAsync(gi =>
            gi.GroupId == groupId &&
            gi.ReceiverUserId == dto.ReceiverUserId &&
            gi.State == FriendshipState.Pending);

        if (pendingInviteExists)
            return BadRequest("A pending invite already exists for this user.");

        var invite = new GroupInvite
        {
            GroupId = groupId,
            RequesterUserId = userId,
            ReceiverUserId = dto.ReceiverUserId,
            CreatedAt = DateTime.UtcNow,
            State = FriendshipState.Pending
        };

        _db.GroupInvites.Add(invite);
        await _db.SaveChangesAsync();
        return Ok(new SendGroupInviteResDTO(invite.Id));
    }

    [Authorize]
    [HttpPost("AcceptInvite/{inviteId}")]
    public async Task<IActionResult> AcceptInvite([FromRoute] int inviteId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var invite = await _db.GroupInvites
            .FirstOrDefaultAsync(i => i.Id == inviteId);

        if (invite is null)
            return NotFound("Invite not found.");

        if (invite.ReceiverUserId != userId)
            return Forbid();

        if (invite.State != FriendshipState.Pending)
            return BadRequest("This invite is no longer pending.");

        var alreadyMember = await _db.GroupUsers
            .AnyAsync(gu => gu.GroupId == invite.GroupId && gu.UserId == userId);

        if (alreadyMember)
            return BadRequest("You are already a member of this group.");

        var membership = new GroupUser
        {
            GroupId = invite.GroupId,
            UserId = userId,
            Role = GroupRole.Member // default member role
        };

        invite.State = FriendshipState.Accepted;

        _db.GroupUsers.Add(membership);
        await _db.SaveChangesAsync();

        return Ok("Invite accepted successfully.");
    }

    [Authorize]
    [HttpDelete("RemoveMember/{groupId}/{userId}")]
    public async Task<IActionResult> RemoveMember(
    [FromRoute] int groupId,
    [FromRoute] string userId)
    {
        var requesterUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(requesterUserId))
            return Unauthorized();

        var groupExists = await _db.Groups.AnyAsync(g => g.Id == groupId);
        if (!groupExists)
            return NotFound("Group not found.");

        var requesterMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == requesterUserId);

        if (requesterMembership is null)
            return Forbid();

        if (requesterMembership.Role != GroupRole.Owner && requesterMembership.Role != GroupRole.Moderator)
            return Forbid();

        var targetMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);

        if (targetMembership is null)
            return NotFound("User is not a member of this group.");

        if (userId == requesterUserId)
            return BadRequest("You cannot remove yourself from the group using this endpoint.");

        _db.GroupUsers.Remove(targetMembership);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    #endregion
    #region Members

    [HttpGet("GetGroupMembers")]
    public async Task<IActionResult> GetGroupMembers([FromQuery] GetGroupMembersReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var groupExists = await _db.Groups.AnyAsync(g => g.Id == dto.GroupId);

        if (!groupExists)
        {
            return NotFound();
        }

        var query = _db.GroupUsers.Where(gu => gu.GroupId == dto.GroupId);

        if (dto.Role is not null)
        {
            query = query.Where(gu => gu.Role == dto.Role);
        }
        if (dto.LastTimestamp is not null)
        {
            query = query.Where(gu => gu.JoinedAt < dto.LastTimestamp.Value);
        }

        var results = await query
        .Include(gu => gu.AppUser).ThenInclude(u => u.UserProfile)
        .OrderByDescending(gu => gu.JoinedAt)
        .ThenByDescending(gu => gu.UserId)
        .Take(maxResults + 1)
        .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var data = page.Select(GroupMemberDto.FromEntity);
        var lastTime = hasMore ? page[^1].JoinedAt : (DateTime?)null;

        return Ok(new GetGroupMembersResDto(data, hasMore, lastTime));
    }

    #endregion // Members
    #region Posts



    #endregion // Posts
}