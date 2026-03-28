using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]/[action]")]
[ApiController]
public class StatsController : ControllerBase 
{
    private readonly ILogger<StatsController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public StatsController(
    ILogger<StatsController> logger,
    AppDbContext db,
    UserManager<AppUser> userManager
)
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
    }

    [HttpGet()]
    public async Task<IActionResult> GetPinsCreatedToday()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var value = await _db.Pins
            .CountAsync(p => p.CreatedAt >= today && p.CreatedAt < tomorrow);

        return Ok(new GetPinsCreatedTodayResDTO(value));
    }

    [HttpGet()]
    public async Task<IActionResult> GetReportsWaitingReview()
    {
        var pinReports = await _db.PinReports.CountAsync();
        var commentReports = await _db.CommentReports.CountAsync();

        var total = pinReports + commentReports;

        return Ok(new GetReportsWaitingReviewResDTO(total));
    }

    [HttpGet()]
    public async Task<IActionResult> GetAverageVotesPerPin(
    [FromQuery] int month,
    [FromQuery] int year)
    {
        if (month < 1 || month > 12)
            return BadRequest("Invalid month");

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);

        var totalPublishedPins = await _db.Pins
            .CountAsync(p => p.CreatedAt >= start && p.CreatedAt < end);

        // número de dias no mês
        var daysInMonth = DateTime.DaysInMonth(year, month);

        var average = Math.Round((double)totalPublishedPins / daysInMonth, 2);

        return Ok(new GetAveragePublishedPinsResDTO(average));
    }

    [HttpGet()]
    public async Task<IActionResult> GetAveragePublishedPins(
        [FromQuery] int month,
        [FromQuery] int year)
    {
        if (month < 1 || month > 12)
            return BadRequest("Invalid month");

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);

        var totalPublishedPins = await _db.Pins
            .CountAsync(p => p.CreatedAt >= start && p.CreatedAt < end);

        var daysInMonth = DateTime.DaysInMonth(year, month);

        var value = Math.Round((double)totalPublishedPins / daysInMonth, 2);

        return Ok(new GetAveragePublishedPinsResDTO(value));
    }

    [HttpGet()]
    public async Task<IActionResult> GetActiveUsers()
    {
        var lastMonth = DateTime.UtcNow.AddDays(-30);

        var value = await _db.Pins
            .Where(p => p.CreatedAt >= lastMonth)
            .Select(p => p.UserId)
            .Distinct()
            .CountAsync();

        return Ok(new GetActiveUsersResDTO(value));
    }



}

