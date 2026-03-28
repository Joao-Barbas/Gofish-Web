using GofishApi.Data;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]")]
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



}

