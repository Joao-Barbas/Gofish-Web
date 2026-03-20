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

/*
 * TODO:
 * Rename this to 'UserController'
 * 
 * Other controllers like:
 * UserStatsController
 * UserAccountController (?)
 * UserAuthController (?)
 * UserInventoryController (?)
 * UserProfileController (?)
 * 
 * (?) - Maybe
 */

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

    // [Authorize]
    // [HttpGet("GetProfile")]
    // public async Task<IActionResult> GetProfile()
    // {
    //     var userId = User.Claims.First(c => c.Type == "UserId").Value;
    //     var user = await _userManager.FindByIdAsync(userId);
    //     if (user is null) return NotFound();
    //     return Ok(new
    //     {
    //         Email = user.Email,
    //         FirstName = user.FirstName,
    //         LastName = user.LastName
    //     });
    // }

    #region Friendship

    [HttpGet]
    public async Task<IActionResult> GetFriendships(
        [FromQuery] bool includeFriends = false,
        [FromQuery] bool includeRequested = false,
        [FromQuery] bool includeReceived = false,
        [FromQuery] int maxResults = 20,
        [FromQuery] DateTime? lastTimestamp = null
    )
    {
        maxResults = Math.Clamp(maxResults, 1, 100);

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var filters = new List<IQueryable<Friendship>>();

        if (includeFriends)
        {
            filters.Add(_db.Friendships.Where(f => (f.RequesterUserId == userId || f.ReceiverUserId == userId)
                && f.State == FriendshipState.Accepted));
        }
        if (includeRequested)
        {
            filters.Add(_db.Friendships.Where(f => f.RequesterUserId == userId
                && f.State == FriendshipState.Pending));
        }
        if (includeReceived)
        {
            filters.Add(_db.Friendships.Where(f => f.ReceiverUserId == userId
                && f.State == FriendshipState.Pending));
        }
        if (filters.Count == 0)
        {
            return Ok(new GetFriendshipsResDto([], false, null));
        }

        var query = filters.Aggregate((a, b) => a.Union(b));

        if (lastTimestamp is not null)
        {
            query = query.Where(f => f.CreatedAt < lastTimestamp.Value);
        }

        var results = await query
            .OrderByDescending(f => f.CreatedAt)
            .ThenByDescending(f => f.RequesterUserId) // Possible tiebreaker
            .Take(maxResults + 1)
            .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var items = page.Select(FriendshipDto.FromEntity);
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetFriendshipsResDto(items, hasMore, lastTime));
    }

    [HttpPost]
    public async Task<IActionResult> RequestFriendship([FromQuery] string receiverId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId == receiverId)
        {
            return ValidationProblem(ProblemDetailsFactory.CreateValidationProblemDetails(
                HttpContext, "CantFriendYourself", "You cannot friend yourself."
            ));
        }

        var receiverExists = await _db.Users.AnyAsync(u => u.Id == receiverId);
        if (!receiverExists)
        {
            return NotFound();
        }

        var existingFriendship = await _db.Friendships.FindAsync(userId, receiverId)
                              ?? await _db.Friendships.FindAsync(receiverId, userId);

        if (existingFriendship is not null)
        {
            return Conflict("Friendship already exists.");
        }

        var friendship = new Friendship
        {
            RequesterUserId = userId,
            ReceiverUserId = receiverId,
            State = FriendshipState.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Friendships.Add(friendship);
        await _db.SaveChangesAsync();
        return Created();
    }

    [HttpPatch]
    public async Task<IActionResult> AcceptFriendship([FromQuery] string requesterId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var friendship = await _db.Friendships.FindAsync(requesterId, userId);
        if (friendship is null || friendship.State != FriendshipState.Pending)
        {
            return NotFound();
        }

        friendship.State = FriendshipState.Accepted;
        friendship.RepliedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch]
    public async Task<IActionResult> IgnoreFriendship([FromQuery] string requesterId)
    {
        // We actually just remove the friendship from the
        // database to allow future re-requests from the same user

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var friendship = await _db.Friendships.FindAsync(requesterId, userId);

        if (friendship is null || friendship.State != FriendshipState.Pending)
        {
            return NotFound();
        }

        _db.Friendships.Remove(friendship);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteFriendship([FromQuery] string receiverId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var friendship = await _db.Friendships.FindAsync(userId, receiverId)
                      ?? await _db.Friendships.FindAsync(receiverId, userId);

        if (friendship is null)
        {
            return NotFound();
        }

        _db.Friendships.Remove(friendship);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    #endregion // Friendship
}
