using GofishApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GofishApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAccountController : ControllerBase
    {
        [Authorize]
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword()
        {
            string userId = User.Claims.First(x => x.Type == "UserId").Value;
            return StatusCode(StatusCodes.Status501NotImplemented);
        }
    }
}
