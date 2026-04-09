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
    private readonly ILogger<GroupController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IBlobStorageService _blobStorage;

    public GroupController(
        ILogger<GroupController> logger,
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
    [HttpGet("GetGroup/{id}")]
    public async Task<IActionResult> GetGroup([FromRoute] int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var group = await _db.Groups
        .Where(g => g.Id == id)
        .Select(g => new
        {
            g.Id,
            g.Name,
            g.Description,
            g.AvatarUrl,
            g.CreatedAt,
            MemberCount = g.GroupUsers.Count,
            PinCount = g.Pins.Count,
            Owner = g.GroupUsers
                .Where(gu => gu.Role == GroupRole.Owner)
                .Select(gu => new
                {
                    gu.AppUser.Id,
                    gu.AppUser.UserName,
                    gu.AppUser.DisplayName,
                    gu.AppUser.UserProfile.AvatarUrl,
                    gu.Role,
                    gu.JoinedAt
                })
                .FirstOrDefault()
        })
        .FirstOrDefaultAsync();

        if (group is null) return NotFound();

        var groupUser = await _db.GroupUsers
        .Include(gu => gu.AppUser)
        .FirstOrDefaultAsync(gu => gu.GroupId == id && gu.UserId == userId);

        var ownerDto = group.Owner is null ? null : new GroupMemberDto(
            group.Owner.Id,
            group.Owner.UserName ?? "",
            group.Owner.DisplayName,
            group.Owner.AvatarUrl,
            group.Owner.Role,
            group.Owner.JoinedAt);

        return Ok(new GroupDto()
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            AvatarUrl = group.AvatarUrl,
            CreatedAt = group.CreatedAt,
            MemberCount = group.MemberCount,
            PinCount = group.PinCount,
            Owner = ownerDto!,
            IsCurrentUserMember = groupUser is not null,
            CurrentUserMembership = groupUser is null ? null : GroupMemberDto.FromEntity(groupUser)
        });
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

            var groupPins = await _db.GroupPins
                .Where(gp => gp.GroupId == groupId)
                .ToListAsync();

            var pinIds = groupPins
                .Select(gp => gp.PinId)
                .Distinct()
                .ToList();

            var pins = await _db.Pins
                .Where(p => pinIds.Contains(p.Id))
                .ToListAsync();

            foreach (var pin in pins)
            {
                var groupCount = await _db.GroupPins.CountAsync(gp => gp.PinId == pin.Id);
                if (groupCount == 1)
                {
                    pin.Visibility = VisibilityLevel.Private;
                }
            }

            _db.GroupUsers.RemoveRange(memberships);
            _db.GroupInvites.RemoveRange(invites);
            _db.GroupPins.RemoveRange(groupPins);
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
            .Include(g => g.Pins)
            .ThenInclude(p => p.Votes)
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

    [HttpGet("SearchGroups")]
    public async Task<IActionResult> SearchGroups([FromQuery] SearchGroupsReqDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Query) || dto.Query.Length < 2)
        {
            return Ok(new SearchGroupsResDto([], false, null));
        }

        var maxResults = Math.Clamp(dto.MaxResults, 1, 50);
        var normalizedQuery = dto.Query.ToUpper();

        var query = _db.Groups.Where(g => g.NormalizedName.Contains(normalizedQuery));

        if (dto.LastGroupName is not null)
        {
            query = query.Where(g => g.NormalizedName.CompareTo(dto.LastGroupName.ToUpper()) > 0);
        }

        var results = await query
            .Include(g => g.GroupUsers)
            .Include(g => g.GroupPins)
            .OrderBy(g => g.NormalizedName)
            .Take(maxResults + 1)
            .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var data = page.Select(SearchGroupDto.FromEntity);
        var lastGroupName = hasMore ? page[^1].NormalizedName : null;

        return Ok(new SearchGroupsResDto(data, hasMore, lastGroupName));
    }

    #region ManageMembers

    [HttpPost("CreateGroupInvite")]
    public async Task<IActionResult> CreateGroupInvite([FromBody] SendGroupInviteReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        if (dto.ReceiverUserId == userId)
            return BadRequest("You cannot invite yourself.");

        var group = await _db.Groups.FirstOrDefaultAsync(g => g.Id == dto.GroupId);
        if (group is null) return NotFound();

        var isAllowed = await _db.GroupUsers.AnyAsync(gu =>
            gu.GroupId == dto.GroupId &&
            gu.UserId == userId &&
            (gu.Role == GroupRole.Owner || gu.Role == GroupRole.Moderator));

        if (!isAllowed)
            return Forbid();

        var receiverExists = await _userManager.FindByIdAsync(dto.ReceiverUserId);
        if (receiverExists is null)
            return BadRequest("Receiver user does not exist.");

        var alreadyMember = await _db.GroupUsers.AnyAsync(gu =>
            gu.GroupId == dto.GroupId &&
            gu.UserId == dto.ReceiverUserId);

        if (alreadyMember)
            return BadRequest("This user is already a member of the group.");

        var pendingInviteExists = await _db.GroupInvites.AnyAsync(gi =>
            gi.GroupId == dto.GroupId &&
            gi.ReceiverUserId == dto.ReceiverUserId &&
            gi.State == FriendshipState.Pending);

        if (pendingInviteExists)
            return BadRequest("A pending invite already exists for this user.");

        var invite = new GroupInvite
        {
            GroupId = dto.GroupId,
            RequesterUserId = userId,
            ReceiverUserId = dto.ReceiverUserId,
            CreatedAt = DateTime.UtcNow,
            State = FriendshipState.Pending
        };

        _db.GroupInvites.Add(invite);
        await _db.SaveChangesAsync();
        return Ok(new SendGroupInviteResDTO(invite.Id));
    }

    [HttpPatch("AcceptGroupInvite/{inviteId}")]
    public async Task<IActionResult> AcceptGroupInvite([FromRoute] int inviteId)
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

        return Ok();
    }

    [HttpPatch("PromoteMemberToAdmin/{groupId}/{userId}")]
    public async Task<IActionResult> PromoteMemberToAdmin([FromRoute] int groupId, [FromRoute] string userId)
    {
        var requesterUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(requesterUserId)) return Unauthorized();
        var groupExists = await _db.Groups.AnyAsync(g => g.Id == groupId);
        if (!groupExists) return NotFound("Group not found.");

        var requesterMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == requesterUserId);

        if(requesterMembership is null || requesterMembership.Role != GroupRole.Owner) return Forbid();

        var targetMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);

        if (targetMembership is null)
            return NotFound("User is not a member of this group.");

        if (targetMembership.UserId == requesterUserId) return BadRequest("You cannot promote yourself.");

        if (targetMembership.Role == GroupRole.Owner) return BadRequest("The owner cannot be promoted.");

        if (targetMembership.Role == GroupRole.Moderator) return BadRequest("This user is already an admin.");
        targetMembership.Role = GroupRole.Moderator;

        await _db.SaveChangesAsync();

        return Ok(new UpdateGroupMemberRoleResDto(
            groupId,
            userId,
            targetMembership.Role.ToString(),
            "User promoted successfully."
        ));
    }

    [HttpPatch("PromoteMemberToOwner/{groupId}/{userId}")]
    public async Task<IActionResult> PromoteMemberToOwner([FromRoute] int groupId, [FromRoute] string userId)
    {
        var requesterUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(requesterUserId))
            return Unauthorized();

        var groupExists = await _db.Groups.AnyAsync(g => g.Id == groupId);
        if (!groupExists)
            return NotFound("Group not found.");

        var currentOwnerMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == requesterUserId);

        if (currentOwnerMembership is null || currentOwnerMembership.Role != GroupRole.Owner)
            return Forbid();

        var targetMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);

        if (targetMembership is null)
            return NotFound("User is not a member of this group.");

        if (targetMembership.UserId == requesterUserId)
            return BadRequest("You are already the owner.");

        if (targetMembership.Role == GroupRole.Owner)
            return BadRequest("This user is already the owner.");

        currentOwnerMembership.Role = GroupRole.Moderator;
        targetMembership.Role = GroupRole.Owner;

        await _db.SaveChangesAsync();

        return Ok(new UpdateGroupMemberRoleResDto(
            groupId,
            userId,
            targetMembership.Role.ToString(),
            "Ownership transferred successfully."
        ));
    }

    [HttpPatch("DemoteAdminToMember/{groupId}/{userId}")]
    public async Task<IActionResult> DemoteAdminToMember([FromRoute] int groupId, [FromRoute] string userId)
    {
        var requesterUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(requesterUserId))
            return Unauthorized();

        var groupExists = await _db.Groups.AnyAsync(g => g.Id == groupId);
        if (!groupExists)
            return NotFound("Group not found.");

        var requesterMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == requesterUserId);

        if (requesterMembership is null || requesterMembership.Role != GroupRole.Owner)
            return Forbid();

        var targetMembership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);

        if (targetMembership is null)
            return NotFound("User is not a member of this group.");

        if (targetMembership.UserId == requesterUserId)
            return BadRequest("You cannot demote yourself.");

        if (targetMembership.Role == GroupRole.Owner)
            return BadRequest("The owner cannot be demoted.");

        if (targetMembership.Role == GroupRole.Member)
            return BadRequest("This user is already a member.");

        targetMembership.Role = GroupRole.Member;

        await _db.SaveChangesAsync();

        return Ok(new UpdateGroupMemberRoleResDto(
            groupId,
            userId,
            targetMembership.Role.ToString(),
            "User demoted successfully."
        ));
    }

    [HttpDelete("DeleteGroupInvite/{inviteId}")]
    public async Task<IActionResult> DeleteGroupInvite([FromRoute] int inviteId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var invite = await _db.GroupInvites.FindAsync(inviteId);
        if (invite is null) return NotFound();

        // Only receiver or requester can delete
        var isParticipant = invite.ReceiverUserId == userId || invite.RequesterUserId == userId;
        if (!isParticipant) return NotFound();

        // Can only delete pending invites
        if (invite.State != FriendshipState.Pending)
        {
            throw new AppValidationException("State", "Only pending invites can be deleted.");
        }

        _db.GroupInvites.Remove(invite);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("IgnoreGroupInvite/{inviteId}")]
    public async Task<IActionResult> IgnoreGroupInvite([FromRoute] int inviteId)
    {
        return await DeleteGroupInvite(inviteId);
    }

    [HttpDelete("RemoveMember/{groupId}/{userId}")]
    public async Task<IActionResult> RemoveMember([FromRoute] int groupId, [FromRoute] string userId)
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

        if (targetMembership.Role == GroupRole.Owner)
            return Forbid();

        if (requesterMembership.Role == GroupRole.Moderator &&
            targetMembership.Role == GroupRole.Moderator)
            return Forbid();

        _db.GroupUsers.Remove(targetMembership);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("LeaveGroup{groupId}")]
    public async Task<IActionResult> LeaveGroup([FromRoute] int groupId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var membership = await _db.GroupUsers
            .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);

        if (membership is null)
            return NotFound("You are not a member of this group.");

        if (membership.Role == GroupRole.Owner)
            return BadRequest("The owner cannot leave the group without transferring ownership or deleting the group.");

        _db.GroupUsers.Remove(membership);
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
    #region Pins

    [HttpGet("GetGroupPins")]
    public async Task<IActionResult> GetGroupPins([FromQuery] GetGroupPinsReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var isMember = await _db.GroupUsers.AnyAsync(gu => gu.GroupId == dto.GroupId &&gu.UserId == userId);

        if (!isMember)
        {
            return NotFound();
        }

        var query = _db.Pins.Where(p => p.Groups.Any(g => g.Id == dto.GroupId));

        if (dto.Kind is not null)
        {
            query = query.Where(p => p.Kind == dto.Kind);
        }
        if (dto.LastTimestamp is not null)
        {
            query = query.Where(p => p.CreatedAt < dto.LastTimestamp.Value);
        }

        query = query.Include(p => p.Votes);
        query = query.Include(p => p.AppUser)
            .ThenInclude(u => u.UserProfile);
        query = query.Include(p => p.Comments)
            .ThenInclude(c => c.AppUser)      // TODO: Are these necessary?
            .ThenInclude(u => u.UserProfile); // TODO: Are these necessary?
        query = query.Include(p => p.Groups);

        query = query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(maxResults + 1);

        var pins = await query.Select(p => PinDto.FromEntity(p)
            .SetGeolocation(p)
            .SetAuthor(p.AppUser, p.AppUser.UserProfile)
            .SetDetails(p)
            .SetUgc(p)
            .SetStats(new(
                p.Votes.Where(v => v.UserId == userId).Select(v => (VoteKind?)v.Value).FirstOrDefault(),
                p.Votes.Sum(v => (int)v.Value),
                p.Comments.Count)))
            .ToListAsync();

        var hasMore = pins.Count > maxResults;
        var paginatedPins = pins.Take(maxResults).ToList();
        var lastTimestamp = hasMore ? paginatedPins[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetGroupPinsResDto(paginatedPins, hasMore, lastTimestamp));
    }

    #endregion // Posts
} 