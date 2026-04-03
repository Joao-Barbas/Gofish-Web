using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Extensions;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using System.Diagnostics.Metrics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]/[action]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;
    private readonly IGamificationService _gamification;
    private readonly IVisibilityService _visibility;

    public UserController(
        ILogger<UserController> logger,
        UserManager<AppUser> userManager,
        AppDbContext db,
        IGamificationService gamification,
        IVisibilityService visibility
    )
    {
        _logger = logger;
        _userManager = userManager;
        _db = db;
        _gamification = gamification;
        _visibility = visibility;
    }

    #region User

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var thisUser = await _db.Users.FindAsync(id);

        if (thisUser is null)
        {
            return NotFound();
        }

        var friendship = await _db.Friendships.FirstOrDefaultAsync(f =>
            (f.RequesterUserId == authUserId && f.ReceiverUserId == id) ||
            (f.RequesterUserId == id && f.ReceiverUserId == authUserId));

        return Ok(GetUserResDto.FromEntity(thisUser, friendship?.State));
    }

    [HttpGet]
    public async Task<IActionResult> GetUserSettings()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return NotFound();
        }

        var data = GetUserSettingsResDto.FromEntity(user) with
        {
            Email = MaskEmail(user.Email),
            PhoneNumber = MaskPhone(user.PhoneNumber)
        };

        return Ok(data);
    }

    [HttpPut]
    public async Task<IActionResult> PutUser([FromBody] PutUserReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        using var transaction = await _db.Database.BeginTransactionAsync();

        var gamificationResult = await _gamification.TryDecrementPoints(userId, 100);
        if (!gamificationResult.Succeeded) throw new GamificationException(gamificationResult);

        user.UserName = dto.UserName;
        user.PhoneNumber = dto.PhoneNumber;
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) throw new IdentityException(result);

        if (dto.Email != user.Email)
        {
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, dto.Email);
            var result2 = await _userManager.ChangeEmailAsync(user, dto.Email, token);
            if (!result2.Succeeded) throw new IdentityException(result2);
        }

        await transaction.CommitAsync();
        return Ok();
    }

    [HttpPatch]
    public async Task<IActionResult> PatchUser([FromBody] PatchUserReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        using var transaction = await _db.Database.BeginTransactionAsync();

        if (dto.UserName is not null)
        {
            var gamificationResult = await _gamification.TryDecrementPoints(userId, 100);
            if (!gamificationResult.Succeeded) throw new GamificationException(gamificationResult);
            user.UserName = dto.UserName;
        }

        if (dto.PhoneNumber is not null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.FirstName is not null) user.FirstName = dto.FirstName;
        if (dto.LastName is not null) user.LastName = dto.LastName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) throw new IdentityException(result);

        if (dto.Email is not null && dto.Email != user.Email)
        {
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, dto.Email);
            var result2 = await _userManager.ChangeEmailAsync(user, dto.Email, token);
            if (!result2.Succeeded) throw new IdentityException(result2);
        }

        // TODO: Email change auto verifies this way
        // TODO: Implement proper change email flow: change -> send confirm email -> confirm

        await transaction.CommitAsync();
        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> SearchUsers([FromQuery] SearchUsersReqDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Query) || dto.Query.Length < 2)
        {
            return Ok(new SearchUsersResDto([], false, null));
        }

        var maxResults = Math.Clamp(dto.MaxResults, 1, 50);
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var normalizedQuery = dto.Query.ToUpper();

        var query = _db.Users
            .Where(u => u.Id != userId)
            .Where(u => u.NormalizedUserName!.Contains(normalizedQuery));

        if (dto.LastUsername is not null)
        {
            query = query.Where(u => u.NormalizedUserName!.CompareTo(dto.LastUsername.ToUpper()) > 0);
        }

        var users = await query
            .OrderBy(u => u.NormalizedUserName)
            .Take(maxResults + 1)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.FirstName,
                u.LastName,
                u.UserProfile.AvatarUrl,
                u.UserProfile.CatchPoints,
                u.NormalizedUserName
            })
            .ToListAsync();

        var hasMore = users.Count > maxResults;
        var page = users.Take(maxResults).ToList();

        var data = page.Select(u => new SearchUserDto
        {
            Id = u.Id,
            UserName = u.UserName ?? "",
            FirstName = u.FirstName ?? "",
            LastName = u.LastName ?? "",
            AvatarUrl = u.AvatarUrl,
            CatchPoints = u.CatchPoints,
            Rank = GamificationService.GetRank(u.CatchPoints),
        })
        .ToList();

        var lastUsername = hasMore ? users[^1].NormalizedUserName : null;
        return Ok(new SearchUsersResDto(data, hasMore, lastUsername));
    }















    [HttpGet]
    public async Task<IActionResult> GetGlobalLeaderboard()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var top100 = await _db.UserProfiles
        .OrderByDescending(up => up.CatchPoints)
        .Take(100)
        .Select(up => new {
            up.UserId,
            up.AppUser.UserName,
            up.AppUser.FirstName,
            up.AppUser.LastName,
            up.AvatarUrl,
            up.CatchPoints,
            up.CatchPointsLastMonth
        })
        .ToListAsync();

        var entries = top100.Select((u, i) => new LeaderboardUserDto
        { 
            Position         = i + 1,
            UserId           = u.UserId,
            UserName         = u.UserName ?? "",
            FirstName        = u.FirstName ?? "",
            LastName         = u.LastName ?? "",
            AvatarUrl        = u.AvatarUrl,
            CatchPoints      = u.CatchPoints,
            CatchPointsDelta = u.CatchPoints - u.CatchPointsLastMonth,
            Rank             = GamificationService.GetRank(u.CatchPoints),
        })
        .ToList();

        var currentUser = entries.FirstOrDefault(e => e.UserId == userId);

        if (currentUser is null)
        {
            // User isn't in top 100.
            // Fetch their position separately

            var userProfile = await _db.UserProfiles
            .Where(up => up.UserId == userId)
            .Select(up => new
            {
                up.CatchPoints,
                up.AvatarUrl,
                up.AppUser.UserName,
                up.AppUser.FirstName,
                up.AppUser.LastName,
                up.CatchPointsLastMonth
            })
            .FirstOrDefaultAsync();

            if (userProfile is null)
            {
                return BadRequest("Current does not has a profile.");
            }

            var position = await _db.UserProfiles.CountAsync(up => up.CatchPoints > userProfile.CatchPoints) + 1;
            currentUser = new LeaderboardUserDto
            {
                Position         = position,
                UserId           = userId,
                UserName         = userProfile.UserName ?? "",
                FirstName        = userProfile.FirstName ?? "",
                LastName         = userProfile.LastName ?? "",
                AvatarUrl        = userProfile.AvatarUrl,
                CatchPoints      = userProfile.CatchPoints,
                CatchPointsDelta = userProfile.CatchPoints - userProfile.CatchPointsLastMonth,
                Rank             = GamificationService.GetRank(userProfile.CatchPoints),
            };
        }

        return Ok(new LeaderboardResDto(entries, currentUser));
    }

    [HttpGet]
    public async Task<IActionResult> GetFriendsLeaderboard()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        List<string> friendIds =
        [
            .. await _visibility.GetFriendIds(userId).ToListAsync(),
            userId, // Include self
        ];

        var top25 = await _db.UserProfiles
        .Where(up => friendIds.Contains(up.UserId))
        .OrderByDescending(up => up.CatchPoints)
        .Take(25)
        .Select(up => new
        {
            up.UserId,
            up.AppUser.UserName,
            up.AppUser.FirstName,
            up.AppUser.LastName,
            up.AvatarUrl,
            up.CatchPoints,
            up.CatchPointsLastMonth
        })
        .ToListAsync();

        var entries = top25.Select((u, i) => new LeaderboardUserDto
        {
            Position         = i + 1,
            UserId           = u.UserId,
            UserName         = u.UserName ?? "",
            FirstName        = u.FirstName ?? "",
            LastName         = u.LastName ?? "",
            AvatarUrl        = u.AvatarUrl,
            CatchPoints      = u.CatchPoints,
            CatchPointsDelta = u.CatchPoints - u.CatchPointsLastMonth,
            Rank             = GamificationService.GetRank(u.CatchPoints)
        })
        .ToList();

        var currentUser = entries.FirstOrDefault(e => e.UserId == userId);

        return Ok(new LeaderboardResDto(entries, currentUser));
    }




















    // Helpers

    private static string? MaskEmail(string? email)
    {
        if (email is null) return null;
        var parts = email.Split('@');
        if (parts.Length != 2) return email;
        var name = parts[0];
        var masked = name[0] + new string('*', Math.Max(name.Length - 1, 1));
        return $"{masked}@{parts[1]}";
    }

    private static string? MaskPhone(string? phone)
    {
        if (phone is null) return null;
        if (phone.Length <= 4) return new string('*', phone.Length);
        return phone[..4] + " *** *** " + phone[^3..];
    }

    #endregion // User
    #region Friendship

    [HttpGet]
    public async Task<IActionResult> GetFriendships([FromQuery] GetFriendshipsReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var targetUserId = dto.UserId ?? authUserId;

        var userExists = await _db.Users.AnyAsync(u => u.Id == targetUserId);
        if (!userExists) return NotFound();

        var isAuthUser = targetUserId == authUserId;
        if (!isAuthUser && dto.State != FriendshipState.Accepted)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ProblemDetailsFactory.CreateValidationProblemDetails(
                HttpContext, "Forbidden", "You cannot view pending requests of other users."));
        }

        var query = _db.Friendships.Where(f => f.RequesterUserId == targetUserId || f.ReceiverUserId == targetUserId);

        if (dto.State is not null)
            query = query.Where(f => f.State == dto.State);
        if (dto.LastTimestamp is not null)
            query = query.Where(f => f.CreatedAt < dto.LastTimestamp.Value);

        var results = await query
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .OrderByDescending(f => f.CreatedAt)
        .ThenByDescending(f => f.Id)
        .Take(maxResults + 1)
        .ToListAsync();

        // Plama noobalhao

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var data = page.Select(FriendshipDto.FromEntity);
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetFriendshipsResDto(data, hasMore, lastTime));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFriendship(int id)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .FirstOrDefaultAsync(f => f.Id == id);

        if (friendship is null) return NoContent();
        if (!IsParticipant(authUserId, friendship)) return NotFound();

        return Ok(FriendshipDto.FromEntity(friendship));
    }

    [HttpGet]
    public async Task<IActionResult> GetFriendshipBetween([FromQuery] GetFriendshipBetweenReqDto dto)
    {
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships
        .Include(f => f.Requester).ThenInclude(u => u.UserProfile)
        .Include(f => f.Receiver).ThenInclude(u => u.UserProfile)
        .FirstOrDefaultAsync(f =>
            (f.RequesterUserId == dto.UserId1 && f.ReceiverUserId == dto.UserId2) ||
            (f.RequesterUserId == dto.UserId2 && f.ReceiverUserId == dto.UserId1)
        );

        if (friendship is null) return NoContent();
        if (!IsParticipant(authUserId, friendship)) return NotFound();

        return Ok(FriendshipDto.FromEntity(friendship));
    }

    [HttpPost]
    public async Task<IActionResult> RequestFriendship([FromBody] RequestFriendshipReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId == dto.ReceiverId)
        {
            return BadRequest(ProblemDetailsFactory.CreateValidationProblemDetails(
                HttpContext, "InvalidReceiver", "You cannot send a friend request to yourself."));
        }

        var receiverExists = await _db.Users.AnyAsync(u => u.Id == dto.ReceiverId);
        if (!receiverExists) return NotFound();

        var friendshipExists = await _db.Friendships.AnyAsync(f =>
            (f.RequesterUserId == userId && f.ReceiverUserId == dto.ReceiverId) ||
            (f.RequesterUserId == dto.ReceiverId && f.ReceiverUserId == userId));
        if (friendshipExists) return Conflict();

        var friendship = new Friendship
        {
            RequesterUserId = userId,
            ReceiverUserId  = dto.ReceiverId,
            State           = FriendshipState.Pending,
            CreatedAt       = DateTime.UtcNow
        };

        _db.Friendships.Add(friendship);
        await _db.SaveChangesAsync();

        var res = new RequestFriendshipResDto(friendship.Id);
        return CreatedAtAction(nameof(GetFriendship), res, res);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> AcceptFriendship(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships.FindAsync(id);

        if (friendship is null
            || friendship.State != FriendshipState.Pending
            || friendship.ReceiverUserId != userId
        )
        {
            return NotFound();
        }

        friendship.State = FriendshipState.Accepted;
        friendship.RepliedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFriendship(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships.FindAsync(id);
        if (friendship is null) return NotFound();

        // Only participants can delete
        var isParticipant = friendship.RequesterUserId == userId || friendship.ReceiverUserId == userId;
        if (!isParticipant) return NotFound();

        _db.Friendships.Remove(friendship);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> IgnoreFriendship(int id)
    {
        return await DeleteFriendship(id);
    }

    // Helpers

    private bool IsParticipant(string authUserId, Friendship friendship)
    {
        // Only participants can view pending/refused friendships
        // Return 404 instead of 403 to not reveal existence to unwanted users
        var isParticipant = friendship.RequesterUserId == authUserId || friendship.ReceiverUserId == authUserId;
        if (!isParticipant && friendship.State != FriendshipState.Accepted) return false;
        return true;
    }

    #endregion // Friendship
    #region Groups

    [HttpGet]
    public async Task<IActionResult> GetUserGroups([FromQuery] GetUserGroupReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var authUserId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var targetUserId = dto.UserId ?? authUserId;

        var userExists = await _db.Users.AnyAsync(u => u.Id == targetUserId);
        if (!userExists) return NotFound();

        var query = _db.Groups.Where(g => g.GroupUsers.Any(gu => gu.UserId == targetUserId));

        if (dto.LastTimestamp is not null)
            query = query.Where(g => g.CreatedAt < dto.LastTimestamp.Value);

        var results = await query
        .OrderByDescending(g => g.CreatedAt)
        .Take(maxResults + 1)
        .Select(g => UserGroupDto
            .FromEntity(g)
            .SetRole(g.GroupUsers.First(gu => gu.UserId == targetUserId).Role)
            .SetMemberQty(g.GroupUsers.Count)
            .SetPinQty(g.Pins.Count))
        .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetUserGroupResDto(page, hasMore, lastTime));
    }

    // TODO: Get group invites

    #endregion // Groups
}
