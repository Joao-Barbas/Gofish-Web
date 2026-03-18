using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Enums;
using GofishApi.Exceptions;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Net.NetworkInformation;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace GofishApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostController : ControllerBase
{
    private readonly ILogger<PostController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public PostController(
        ILogger<PostController> logger,
        AppDbContext db,
        UserManager<AppUser> userManager
    )
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
    }

    [Authorize]
    [HttpPost("GetPosts")]
    public async Task<IActionResult> GetPosts([FromBody] GetPostsReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();
        var postIds = new List<int>();

        foreach (var id in dto.Ids)
        {
            if (id.PostId is not null)
            {
                postIds.Add(id.PostId.Value);
            }
            if (!string.IsNullOrWhiteSpace(id.AuthorId))
            {
                var authorPostIds = await _db.Posts
                    .Where(p => p.UserId == id.AuthorId)
                    .Select(p => p.Id)
                    .ToListAsync();

                foreach (var postId in authorPostIds)
                {
                    postIds.Add(postId);
                }
            }
            if (id.GroupId is not null)
            {
                var groupPostIds = await _db.Posts
                    .Where(p => p.Groups.Any(g => g.Id == id.GroupId.Value))
                    .Select(p => p.Id)
                    .ToListAsync();

                foreach (var postId in groupPostIds)
                {
                    postIds.Add(postId);
                }
            }
        }
        var posts = await _db.Posts
            .Where(p => postIds.Contains(p.Id))
            .Where(p => p.CreatedAt > dto.LastTimestamp)
            .Include(p => p.PostVotes)
            .Include(p => p.Pin)
            .Include(p => p.AppUser)
            .Include(p => p.Groups)
            .Include(p => p.Comments)
            .Take(dto.MaxResults + 1)
            .ToListAsync();

        var hasMore = posts.Count > dto.MaxResults;

        var data = posts
            .Take(dto.MaxResults)
            .Select(p => GetPostsPostDTO.FromPost(p, dto.DataRequest))
            .ToList();

        var lastTimestamp = hasMore ? posts[^2].CreatedAt : (DateTime?)null;
        return Ok(new GetPostsResDTO(data, hasMore, lastTimestamp));
    }

    [Authorize]
    [HttpPost("GetFeed")]
    public async Task<IActionResult> GetFeed([FromBody] GetFeedReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();
        IQueryable<Post> query = _db.Posts;

        query = dto.Kind switch
        {
            FeedKind.Discovery => GetDiscoveryFeed(query, userId),
            FeedKind.Friends => GetFriendsFeed(query, userId),
            FeedKind.Groups => GetGroupsFeed(query, userId),
            _ => throw new AppException("Feed tab must be Discovery, Friends, or Groups", StatusCodes.Status400BadRequest)
        };

        var posts = await query
            .Where(p => p.CreatedAt <= dto.LastTimestamp)
            .Include(p => p.PostVotes)
            .Include(p => p.Pin)
            .Include(p => p.AppUser)
            .Include(p => p.Groups)
            .Include(p => p.Comments)
            .OrderByDescending(p => p.CreatedAt)
            .Take(dto.MaxResults + 1)
            .ToListAsync();

        var hasMore = posts.Count > dto.MaxResults;
        var data = posts
            .Take(dto.MaxResults)
            .Select(p => GetPostsPostDTO.FromPost(p, dto.DataRequest))
            .ToList();

        var lastTimestamp = hasMore ? posts[dto.MaxResults].CreatedAt : (DateTime?)null;
        return Ok(new GetFeedResDTO(data, hasMore, lastTimestamp));
    }

    private IQueryable<Post> GetDiscoveryFeed(IQueryable<Post> query, string userId)
    {
        // All public posts + friends' posts with Friends visibility + user's group posts
        var friendIds = _db.Friendships
            .Where(f => (f.RequesterUserId == userId || f.ReceiverUserId == userId)
                && f.State == FriendshipState.Accepted)
            .Select(f => f.RequesterUserId == userId ? f.ReceiverUserId : f.RequesterUserId);

        var userGroupIds = _db.GroupUsers
            .Where(gu => gu.UserId == userId)
            .Select(gu => gu.GroupId);

        return query.Where(p =>
            // All public posts
            p.Pin.Visibility == VisibilityLevel.Public ||
            // Friends' posts with Friends visibility
            (friendIds.Contains(p.UserId) && p.Pin.Visibility == VisibilityLevel.Friends) ||
            // User's own group posts
            (p.Groups.Any(g => userGroupIds.Contains(g.Id)) && p.Pin.Visibility == VisibilityLevel.Group) ||
            // User's own posts
            p.UserId == userId
        );
    }

    private IQueryable<Post> GetFriendsFeed(IQueryable<Post> query, string userId)
    {
        // Only friends' posts (all visibility levels they shared with us)
        var friendIds = _db.Friendships
            .Where(f => (f.RequesterUserId == userId || f.ReceiverUserId == userId)
                && f.State == FriendshipState.Accepted)
            .Select(f => f.RequesterUserId == userId ? f.ReceiverUserId : f.RequesterUserId);

        return query.Where(p =>
            (friendIds.Contains(p.UserId) &&
                (p.Pin.Visibility == VisibilityLevel.Public || p.Pin.Visibility == VisibilityLevel.Friends)) ||
            p.UserId == userId
        );
    }

    private IQueryable<Post> GetGroupsFeed(IQueryable<Post> query, string userId)
    {
        // Posts from user's groups
        var userGroupIds = _db.GroupUsers
            .Where(gu => gu.UserId == userId)
            .Select(gu => gu.GroupId);

        return query.Where(p =>
            p.Groups.Any(g => userGroupIds.Contains(g.Id)) ||
            p.UserId == userId
        );
    }

    [Authorize]
    [HttpDelete("DeletePost/{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var post = await _db.Posts
            .Include(p => p.Pin)
            .FirstOrDefaultAsync(p => p.Id == id); if (post is null) return NotFound();

        var isOwner = post.UserId == userId;
        var isAdmin = User.IsInRole("Admin");
        if (!isOwner && !isAdmin) return Forbid();
        if (post.Pin is not null) _db.Pins.Remove(post.Pin);
        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return NoContent();
    }



    #region Classification

    [Authorize]
    [HttpPost("PostVote/{postId}")]
    public async Task<IActionResult> PostVote(int postId, [FromBody] VotePostDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();
        var postExists = await _db.Posts.AnyAsync(p => p.Id == postId);
        if (!postExists) return NotFound();
        if (!Enum.IsDefined(dto.Value))
            return BadRequest("Invalid vote value.");

        var existingVote = await _db.PostVote
            .FirstOrDefaultAsync(p => p.PostId == postId && p.UserId == userId);

        if (existingVote is null)
        {
            _db.PostVote.Add(new PostVote
            {
                PostId = postId,
                UserId = userId,
                Value = dto.Value
            });
        }
        else if (existingVote.Value == dto.Value) _db.PostVote.Remove(existingVote);
        else existingVote.Value = dto.Value;
        await _db.SaveChangesAsync();
        return Ok();
    }


    #endregion
}