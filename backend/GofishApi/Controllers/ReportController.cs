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
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
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
            report.AppUser.UserProfile.AvatarUrl,
            report.AppUser.UserName,
            "Pin",
            report.PinId,
            report.ReasonText,
            report.Description,
            report.CreatedAt
        ));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("GetPinReportsByPin")]
    public async Task<IActionResult> GetPinReportsByPin([FromQuery] GetPinReportsByPinReqDTO dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);

        IQueryable<PinReport> query = _db.PinReports
            .Where(r => r.PinId == dto.PinId);

        if (dto.LastCreatedAt is not null)
        {
            query = query.Where(r => r.CreatedAt < dto.LastCreatedAt.Value);
        }

        var pinReports = await query
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxResults + 1)
            .Select(r => new GetReportResDTO(
                r.Id,
                r.UserId,
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
                "Pin",
                r.PinId,
                r.ReasonText,
                r.Description,
                r.CreatedAt
            ))
            .ToListAsync();

        var hasMoreResults = pinReports.Count > maxResults;
        var paginatedReports = pinReports.Take(maxResults).ToList();
        var lastTimestamp = hasMoreResults ? paginatedReports[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetReportsResDTO(
            paginatedReports,
            hasMoreResults,
            lastTimestamp
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
                r.AppUser.UserProfile.AvatarUrl,
                r.AppUser.UserName,
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
            report.AppUser.UserProfile.AvatarUrl,
            report.AppUser.UserName,
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
    [HttpDelete("DeletePinReports")]
    public async Task<IActionResult> DeletePinReports([FromBody] DeleteReportsReqDTO dto)
    {
        if (dto == null || dto.Ids == null || !dto.Ids.Any())
            return BadRequest("No ids provided");

        var reports = await _db.PinReports
            .Where(r => dto.Ids.Contains(r.Id))
            .ToListAsync();

        if (reports.Count == 0)
            return NotFound("No reports found");

        _db.PinReports.RemoveRange(reports);
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

    [Authorize(Roles = "Admin")]
    [HttpDelete("ResolvePinReport/{reportId}")]
    public async Task<IActionResult> ResolvePinReport(int reportId)
    {
        var report = await _db.PinReports
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report is null)
            return NotFound("Report not found");

        var pin = await _db.Pins.FindAsync(report.PinId);

        if (pin is null)
            return NotFound("Associated pin not found");

        _db.Pins.Remove(pin);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    #endregion
}
