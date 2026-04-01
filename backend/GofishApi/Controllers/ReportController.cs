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
public class ReportController : ControllerBase
{
    private readonly ILogger<ReportController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public ReportController(
        ILogger<ReportController> logger,
        AppDbContext db,
        UserManager<AppUser> userManager
    )
    {
        _logger = logger;
        _db = db;
        _userManager = userManager;
    }

    #region CreateReports

    [HttpPost("CreatePinReport")]
    public async Task<IActionResult> CreatePinReport([FromBody] CreatePinReportReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var pinExists = await _db.Pins.AnyAsync(p => p.Id == dto.PinId);
        if (!pinExists)
            return NotFound("Pin not found");
        
        var alreadyReported = await _db.PinReports
            .AnyAsync(r => r.UserId == userId && r.PinId == dto.PinId);

        if (alreadyReported)
            return BadRequest("You already reported this pin");

        var report = new PinReport
        {
            PinId = dto.PinId,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow,
            Description = dto.Description,
            UserId = userId
        };

        _db.PinReports.Add(report);
        await _db.SaveChangesAsync();
        return Ok(new CreatePinReportResDTO(report.Id));
    }

    [HttpPost("CreateCommentReport")]
    public async Task<IActionResult> CreateCommentReport([FromBody] CreateCommentReportReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var commentExists = await _db.Comments.AnyAsync(p => p.Id == dto.CommentId);
        if (!commentExists)
            return NotFound("Pin not found");

        var alreadyReported = await _db.CommentReports
            .AnyAsync(r => r.UserId == userId && r.CommentId == dto.CommentId);

        if (alreadyReported)
            return BadRequest("You already reported this pin");

        var report = new CommentReport
        {
            CommentId = dto.CommentId,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow,
            Description = dto.Description,
            UserId = userId
        };

        _db.CommentReports.Add(report);
        await _db.SaveChangesAsync();
        return Ok(new CreateCommentReportResDTO(report.Id));
    }

    #endregion

    #region GetPinReports

    [Authorize(Roles = "Admin")]
    [HttpGet("GetPinReports")]
    public async Task<IActionResult> GetPinsReports([FromQuery] GetReportReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<PinReport> query = _db.PinReports;

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var pinreports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                "Pin",
                r.PinId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = pinreports.Count > maxResults;
        var paginatedReports = pinreports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
        ));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("GetPinReport/{id}")]
    public async Task<IActionResult> GetPinReports(int id)
    {
        var report = await _db.PinReports
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report is null) return NotFound();

        return Ok(new GetReportResDTO(
            report.Id,
            report.UserId,
            "Pin",
            report.PinId,
            report.ReasonText,
            report.Description,
            report.CreatedAt
        ));
    }

    #endregion

    #region GetCommentReports

    [Authorize(Roles = "Admin")]
    [HttpGet("GetCommentReports")]
    public async Task<IActionResult> GetCommentReports([FromQuery] GetReportReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<CommentReport> query = _db.CommentReports;

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var commentReports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                "Comment",
                r.CommentId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = commentReports.Count > maxResults;
        var paginatedReports = commentReports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
        ));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("GetCommentReport/{id}")]
    public async Task<IActionResult> GetCommentReport(int id)
    {
        var report = await _db.CommentReports
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report is null) return NotFound();

        return Ok(new GetReportResDTO(
            report.Id,
            report.UserId,
            "Comment",
            report.CommentId,
            report.ReasonText,
            report.Description,
            report.CreatedAt
        ));
    }


    #endregion

    #region DeleteReports

    [Authorize(Roles = "Admin")]
    [HttpDelete("DeletePinReport/{id}")]
    public async Task<IActionResult> DeletePinReport(int id)
    {
        var report = await _db.PinReports.FindAsync(id);
        if (report is null) return NotFound();
        _db.PinReports.Remove(report);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("DeleteCommentReport/{id}")]
    public async Task<IActionResult> DeleteCommentReport(int id)
    {
        var report = await _db.CommentReports.FindAsync(id);
        if (report is null) return NotFound();
        _db.CommentReports.Remove(report);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    #endregion
}
