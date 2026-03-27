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
using System.Net.NetworkInformation;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class PostController : ControllerBase
{
    private readonly ILogger<PostController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IVisibilityService _visibility;

    public PostController(
        ILogger<PostController> logger,
        AppDbContext db,
        UserManager<AppUser> userManager,
        IVisibilityService visibility
    )
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
        _visibility = visibility;
    }

    [Authorize]
    [HttpPost("GetPosts")]
    public async Task<IActionResult> GetPosts([FromBody] GetPostsReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();

        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var postIds    = new List<int>();

        foreach (var id in dto.Ids)
        {
            if (id.PostId is not null)
            {
                postIds.Add(id.PostId.Value);
            }
            if (id.AuthorId is not null && id.AuthorId != "")
            {
                postIds.AddRange(await _visibility.FilterVisiblePosts(
                    _db.Posts.Where(p => p.UserId == id.AuthorId),
                    userId)
                .Select(p => p.Id)
                .ToListAsync());
            }
            if (id.GroupId is not null)
            {
                postIds.AddRange(await _visibility.FilterVisiblePosts(
                    _db.Posts.Where(p => p.Groups.Any(g => g.Id == id.GroupId.Value)),
                    userId)
                .Select(p => p.Id)
                .ToListAsync());
            }
        }

        IQueryable<Post> query;

        query = _visibility.FilterVisiblePosts(_db.Posts.Where(p => postIds.Distinct().Contains(p.Id)), userId);
        query = ApplyIncludes(query, dto.DataRequest);

        var posts = await query
        .Where(p => p.CreatedAt < dto.LastTimestamp)
        .OrderByDescending(p => p.CreatedAt)
        .Take(maxResults + 1)
        .ToListAsync();

        var hasMore       = posts.Count > maxResults;
        var resultsPage   = posts.Take(maxResults).ToList();
        var data          = resultsPage.Select(p => GetPostsPostDTO.FromPost(p, dto.DataRequest, userId)).ToList();
        var lastTimestamp = hasMore ? resultsPage[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetPostsResDTO(data, hasMore, lastTimestamp));
    }

    [Authorize]
    [HttpPost("GetFeed")]
    public async Task<IActionResult> GetFeed([FromBody] GetFeedReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();

        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        IQueryable<Post> query = dto.Kind switch
        {
            FeedKind.Discovery => _visibility.FilterVisiblePosts(_db.Posts, userId),
            FeedKind.Friends   => GetFriendsFeed(_db.Posts, userId),
            FeedKind.Groups    => GetGroupsFeed(_db.Posts, userId),
            _ => throw new AppValidationException("UnknownFeedKind", "Feed kind must be Discovery, Friends, or Groups")
        };

        query = ApplyIncludes(query, dto.DataRequest);

        var posts = await query
        .Where(p => p.CreatedAt < dto.LastTimestamp)
        .OrderByDescending(p => p.CreatedAt)
        .Take(maxResults + 1)
        .ToListAsync();

        var hasMore        = posts.Count > maxResults;
        var paginatedPosts = posts.Take(maxResults).ToList();
        var data           = paginatedPosts.Select(p => GetPostsPostDTO.FromPost(p, dto.DataRequest, userId)).ToList();
        var lastTimestamp  = hasMore ? paginatedPosts[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetFeedResDTO(data, hasMore, lastTimestamp));
    }

    [Authorize]
    [HttpDelete("DeletePost/{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();

        var post = await _db.Posts
        .Include(p => p.Pin)
        .FirstOrDefaultAsync(p => p.Id == id);
        if (post is null) return NotFound();

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
    public async Task<IActionResult> PostVote(int postId, [FromBody] VotePostReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();

        var postExists = await _db.Posts.AnyAsync(p => p.Id == postId);
        if (!postExists) return NotFound();
        if (!Enum.IsDefined(dto.Value)) return BadRequest("Invalid vote value.");

        var existingVote = await _db.PostVote.FirstOrDefaultAsync(p => p.PostId == postId && p.UserId == userId);

        if (existingVote is null)
        {
            _db.PostVote.Add(new PostVote
            {
                PostId = postId,
                UserId = userId,
                Value = dto.Value
            });
        }
        else if (existingVote.Value == dto.Value)
        {
            _db.PostVote.Remove(existingVote);
        }
        else
        {
            existingVote.Value = dto.Value;
        }

        await _db.SaveChangesAsync();

        var score = await _db.PostVote
        .Where(v => v.PostId == postId)
        .SumAsync(v => (int)v.Value);

        return Ok(new VotePostResDTO(score));
    }

    #endregion // Classification
    #region Comments

    [Authorize]
    [HttpPost("CreateComment")]
    public async Task<IActionResult> CreateComment([FromBody] CreatePostCommentReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (userId is null) return Unauthorized();

        var postExists = await _db.Posts.AnyAsync(p => p.Id == dto.PostId);
        if (!postExists) return NotFound();

        var comment = new PostComment
        {
            PostId = dto.PostId,
            Body = dto.Body,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _db.PostComments.Add(comment);
        await _db.SaveChangesAsync();
        return Ok(new CreatePostCommentResDTO(comment.Id));
    }

    [Authorize]
    [HttpDelete("DeleteComment/{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        var comment = await _db.PostComments.FirstOrDefaultAsync(p => p.Id == id);
        if (comment is null) return NotFound();

        var isOwner = comment.UserId == userId;
        var isAdmin = User.IsInRole("Admin");
        if (!isOwner && !isAdmin) return Forbid();

        _db.PostComments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    #endregion // Comments
    #region Helper

    private static IQueryable<Post> ApplyIncludes(IQueryable<Post> query, PostDataRequestDTO? request)
    {
        // Pin is always needed for visibility, kind, and pin-specific fields

        query = query.Include(p => p.Pin);
        query = query.Include(p => p.PostVotes);

        if (request?.IncludeAuthor ?? false)
            query = query.Include(p => p.AppUser).ThenInclude(u => u.UserProfile);
        if (request?.IncludeComments ?? false)
            query = query.Include(p => p.Comments).ThenInclude(c => c.AppUser);
        if (request?.IncludeGroups ?? false)
            query = query.Include(p => p.Groups);

        return query;
    }

    private IQueryable<Post> GetFriendsFeed(IQueryable<Post> query, string userId)
    {
        var friendIds = _visibility.GetFriendIds(userId);
        return query.Where(p => p.UserId == userId
            || (friendIds.Contains(p.UserId)
            && (p.Pin.Visibility == VisibilityLevel.Public || p.Pin.Visibility == VisibilityLevel.Friends))
        );
    }

    private IQueryable<Post> GetGroupsFeed(IQueryable<Post> query, string userId)
    {
        var groupIds = _visibility.GetGroupIds(userId);
        return query.Where(p => p.UserId == userId
            || p.Groups.Any(g => groupIds.Contains(g.Id))
        );
    }

    #endregion // Helpers
}