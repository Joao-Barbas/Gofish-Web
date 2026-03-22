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

    public UserController(
        ILogger<UserController> logger,
        UserManager<AppUser> userManager,
        AppDbContext db
    )
    {
        _logger = logger;
        _userManager = userManager;
        _db = db;
    }

    /*
     * GET      /api/products        List all (with filtering & pagination)     200 OK
     * GET      /api/products/{id}   Retrieve one resource                      200 OK / 404
     * POST     /api/products        Create a new resource                      201 Created + Location header
     * PUT      /api/products/{id}   Full replace — all fields required         200 OK / 404
     * PATCH    /api/products/{id}   Partial update — only changed fields       200 OK / 404
     * DELETE   /api/products/{id}   Remove a resource                          204 No Content / 404
     *
     * HEAD     /api/products/{id}   Check existence (headers only, no body)    200 / 404
     * OPTIONS  /api/products        Discover allowed methods (CORS preflight)  200 + Allow header
     */

    #region Friendship

    [HttpGet]
    public async Task<IActionResult> GetFriendships([FromQuery] GetFriendshipsReqDto dto)
    {
        var maxResults   = Math.Clamp(dto.MaxResults, 1, 100);
        var authUserId   = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var targetUserId = dto.UserId ?? authUserId;
        var isAuthUser   = targetUserId == authUserId;

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

        var hasMore  = results.Count > maxResults;
        var page     = results.Take(maxResults).ToList();
        var data     = page.Select(FriendshipDto.FromEntity);
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

        if (friendship is null) return NotFound();

        // Only participants can view pending/refused friendships
        // Return 404 instead of 403 to not reveal existence
        var isParticipant = friendship.RequesterUserId == authUserId || friendship.ReceiverUserId == authUserId;
        if (!isParticipant && friendship.State != FriendshipState.Accepted) return NotFound();

        return Ok(FriendshipDto.FromEntity(friendship));
    }

    [HttpPost]
    public async Task<IActionResult> RequestFriendship([FromBody] CreateFriendshipReqDto dto)
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
        return CreatedAtAction(nameof(GetFriendship), new { id = friendship.Id }, new { friendship.Id });
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
        return NoContent();
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

    #endregion // Friendship
}
