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
public class GroupController : ControllerBase
{
    private readonly ILogger<PostController> _logger;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public GroupController(
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
    [HttpPost("GetGroup")]
    public async Task<IActionResult> GetGroup([FromBody] GetGroupReqDTO dto)
    {
        // TODO: Visibility level is not being accounted for yet

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var query = _db.Groups.AsQueryable();

        if (dto.DataRequest?.IncludeMembers ?? true)
        {
            query = query.Include(g => g.AppUsers);
        }

        if (dto.DataRequest?.IncludePosts ?? true)
        {
            query = query
                .Include(g => g.Posts)
                    .ThenInclude(p => p.Pin)
                .Include(g => g.Posts)
                    .ThenInclude(p => p.PostVotes);
        }
        var group = await query.FirstOrDefaultAsync(g => g.Id == dto.GroupId);

        if (group is null)
        {
            return NotFound();
        }

        var data = GetGroupDTO.FromGroup(group, dto.DataRequest);
        return Ok(new GetGroupResDTO(data));
    }


}
