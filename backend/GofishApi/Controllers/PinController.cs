using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PinController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<PinController> _logger;

        public PinController(
            ILogger<PinController> logger,
            AppDbContext db
        ){
            _logger = logger;
            _db = db;
        }

        [Authorize]
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var pins = await _db.CatchPins.ToListAsync();
            return Ok(new
            {
                Success = true,
                Pins = pins
            });
        }

        [Authorize]
        [HttpPost("CreateCatchPin")]
        public async Task<IActionResult> CreateCatchPin(CreateCatchingPinDTO dto) 
        {
            var pin = new CatchPin
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Description = dto.Description,
                CreatedAt = DateTime.Now,
                PinType = PinType.Catch,
                SpeciesType = dto.SpeciesType,
                HookSize = dto.HookSize,
                BaitType = dto.BaitType,
            };
            var result = await _db.CatchPins.AddAsync(pin);
            Console.WriteLine(result);
            return Ok(new 
            {
                Success = true,
                Id = result.Entity.Id
            });
        }
    }
}
