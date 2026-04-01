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

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RatingsController : ControllerBase
{
    private readonly ILogger<StatsController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public RatingsController(
    ILogger<StatsController> logger,
    AppDbContext db,
    UserManager<AppUser> userManager
)
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRating([FromBody] CreateRatingReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();


        var rating = new Rating
        {
            CreatedAt = DateTime.UtcNow,
            Stars = dto.Stars,
            Title = dto.Title,
            Body = dto.Body,
            UserId = user.Id
        };

        _db.Ratings.Add(rating);
        await _db.SaveChangesAsync();
        return Ok(new CreateRatingResDTO(rating.UserId));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRating(int id, [FromBody] UpdateRatingReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var rating = await _db.Ratings.FindAsync(id);
        if (rating is null) return NotFound();

        if (rating.UserId != user.Id)
            return Forbid();

        rating.Stars = dto.Stars;
        rating.Title = dto.Title;
        rating.Body = dto.Body;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetRatings()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var ratings = await _db.Ratings
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new GetRatingResDTO(
                r.UserId,
                r.Stars,
                r.Title,
                r.Body,
                r.CreatedAt
            ))
            .ToListAsync();

        return Ok(new GetRatingsResDTO(ratings));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetRating(string userId)
    {
        var rating = await _db.Ratings
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId);

        if (rating is null) return NotFound();

        return Ok(new GetRatingResDTO(
            rating.UserId,
            rating.Stars,
            rating.Title,
            rating.Body,
            rating.CreatedAt
        ));
    }

}
