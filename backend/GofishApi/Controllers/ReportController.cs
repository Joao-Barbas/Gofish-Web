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

namespace GofishApi.Controllers
{
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

        [Authorize]
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

    }
}
