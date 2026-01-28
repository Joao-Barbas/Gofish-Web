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
        )
        {
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
        public async Task<IActionResult> CreateCatchPin(CreateCatchPinReqDTO dto)
        {
            try
            {
                var pin = new CatchPin
                {
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow,
                    PinType = PinType.Catch,
                    SpeciesType = dto.SpeciesType,
                    HookSize = dto.HookSize,
                    BaitType = dto.BaitType,
                };

                await _db.CatchPins.AddAsync(pin);
                await _db.SaveChangesAsync();

                return Ok(new CreateCatchPinResDTO
                {
                    Success = true,
                    Id = pin.Id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new CreateCatchPinResDTO
                {
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
        }
        [Authorize]
        [HttpPost("CreateInfoPin")]
        public async Task<IActionResult> CreateInfoPin(CreateInfoPinReqDTO dto)
        {
            try
            {
                var pin = new InfoPin
                {
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow,
                    PinType = PinType.Info,
                    AccessDifficulty = dto.AccessDifficulty,
                    SeaBedType = dto.SeaBedType,
                };

                await _db.InfoPins.AddAsync(pin);
                await _db.SaveChangesAsync();

                return Ok(new CreateInfoPinResDTO
                {
                    Success = true,
                    Id = pin.Id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new CreateInfoPinResDTO
                {
                    Success = false,
                    ErrorMessage = ex.Message
                });

            }

        }
        [Authorize]
        [HttpPost("CreateWarnPin")]
        public async Task<IActionResult> CreateWarnPin(CreateWarnPinReqDTO dto)
        {
            try
            {
                var pin = new WarnPin
                {
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow,
                    PinType = PinType.Info,
                    WarnPinType = dto.WarnPinType,
                };

                await _db.WarnPins.AddAsync(pin);
                await _db.SaveChangesAsync();

                return Ok(new CreateWarnPinResDTO
                {
                    Success = true,
                    Id = pin.Id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new CreateWarnPinResDTO
                {
                    Success = false,
                    ErrorMessage = ex.Message
                });

            }

        }

        [Authorize]
        [HttpDelete("DeleteCatchPin/{id}")]
        public async Task<IActionResult> DeleteCatchPin(int id)
        {
            var pin = await _db.CatchPins.FindAsync(id);

            if(pin == null) return NotFound("Pin não encontrado");

            _db.CatchPins.Remove(pin);
            await _db.SaveChangesAsync();

            return Ok("Pin apagado com sucesso");
        }

        [Authorize]
        [HttpDelete("DeleteInfoPin/{id}")]
        public async Task<IActionResult> DeleteInfoPin(int id)
        {
            var pin = await _db.InfoPins.FindAsync(id);

            if (pin == null) return NotFound("Pin não encontrado");

            _db.InfoPins.Remove(pin);
            await _db.SaveChangesAsync();
            return Ok("Pin apagado com sucesso");
        }

        [Authorize]
        [HttpDelete("DeleteWarnPin/{id}")]
        public async Task<IActionResult> DeleteWarnPin(int id)
        {
            var pin = await _db.WarnPins.FindAsync(id);

            if (pin == null) return NotFound("Pin não encontrado");

            _db.WarnPins.Remove(pin);
            await _db.SaveChangesAsync();
            return Ok("Pin apagado com sucesso");
        }
    }
}
