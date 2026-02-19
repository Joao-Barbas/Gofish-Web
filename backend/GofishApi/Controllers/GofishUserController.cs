using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

/*
 * TODO:
 * Rename this to 'UserController'
 * 
 * Other controllers like:
 * UserStatsController
 * UserAccountController (?)
 * UserAuthController (?)
 * UserInventoryController (?)
 * UserProfileController (?)
 * 
 * (?) - Maybe
 */

namespace GofishApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GofishUserController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly UserManager<AppUser> _userManager;

        public GofishUserController(
            ILogger<AuthController> logger,
            UserManager<AppUser> userManager
        )
        {
            _logger = logger;
            _userManager = userManager;
        }

        // [Authorize]
        // [HttpGet("GetProfile")]
        // public async Task<IActionResult> GetProfile()
        // {
        //     var userId = User.Claims.First(c => c.Type == "UserId").Value;
        //     var user = await _userManager.FindByIdAsync(userId);
        //     if (user is null) return NotFound();
        //     return Ok(new
        //     {
        //         Email = user.Email,
        //         FirstName = user.FirstName,
        //         LastName = user.LastName
        //     });
        // }
    }
}
