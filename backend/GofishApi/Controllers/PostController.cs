using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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

        if (user is null)
        {
            return Unauthorized();
        }

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
            .Include(p => p.Pin)
            .Include(p => p.AppUser)
            .Include(p => p.Groups)
            .Include(p => p.Comments)
            .ToListAsync();

        var data = posts
            .Select(p => GetPostsPostDTO.FromPost(p, dto.DataRequest))
            .ToList();

        return Ok(new GetPostsResDTO(data));
    }
}