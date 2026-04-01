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


}
