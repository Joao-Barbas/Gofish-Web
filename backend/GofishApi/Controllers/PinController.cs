using Azure.Core;
using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using GofishApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static GofishApi.Dtos.GetNearbyPinsResDTO;

namespace GofishApi.Controllers
{
            [Route("api/[controller]")]
            [ApiController]
            public class PinController : ControllerBase
            {
                private readonly AppDbContext _db;
                private readonly ILogger<PinController> _logger;
                private readonly BlobStorageService _blobStorage;        

                public PinController(
                    ILogger<PinController> logger,
                    AppDbContext db,
                    BlobStorageService blobStorage
                ){
                    _logger = logger;
                    _db = db;
                    _blobStorage = blobStorage;
                }


            [Authorize]
            [HttpGet("GetInViewport")]
            public async Task<IActionResult> GetInViewport(
                [FromQuery] double minLat,
                [FromQuery] double minLng,
                [FromQuery] double maxLat,
                [FromQuery] double maxLng
            )
            {
            var catchPins = await _db.CatchPins
                .Where(p => p.Latitude >= minLat && p.Latitude <= maxLat && p.Longitude >= minLng && p.Longitude <= maxLng)
                .Select(p => new NearbyPinDTO 
                {
                    Id = p.Id,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    PinType = PinType.Catch,
                    SpeciesType = p.SpeciesType,
                    HookSize = p.HookSize,
                    BaitType = p.BaitType,
                })
                .ToListAsync();
            var infoPins = await _db.InfoPins
                .Where(p => p.Latitude >= minLat && p.Latitude <= maxLat && p.Longitude >= minLng && p.Longitude <= maxLng)
                .Select(p => new NearbyPinDTO
                {
                    Id = p.Id,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    PinType = PinType.Info,
                    AccessDifficulty = p.AccessDifficulty,
                    SeaBedType = p.SeaBedType,
                })
                .ToListAsync();
           var warnPins = await _db.WarnPins
                .Where(p => p.Latitude >= minLat && p.Latitude <= maxLat && p.Longitude >= minLng && p.Longitude <= maxLng)
                .Select(p => new NearbyPinDTO
                {
                    Id = p.Id,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    PinType = PinType.Warning,
                    WarnPinType = p.WarnPinType
,
                })
                .ToListAsync();

            var allPins = new List<NearbyPinDTO>();

            allPins.AddRange(warnPins);
            allPins.AddRange(infoPins);
            allPins.AddRange(catchPins);

            return Ok(new GetNearbyPinsResDTO { Success = true, Pins = allPins });
        }


        [Authorize]
        [HttpGet("GetPinPreview/{type}/{id}")]
        public async Task<IActionResult> GetPinPreview(PinType type, int id)
        {
            GetPinPreviewResDTO? result = type switch
            {
                PinType.Catch => await _db.CatchPins
                    .Where(p => p.Id == id)
                    .Select(p => new GetPinPreviewResDTO
                    {
                        Id = p.Id,
                        ImageUrl = p.ImageUrl,
                        Latitude = p.Latitude,
                        Longitude = p.Longitude,
                        Description = p.Description,
                        CreatedAt = p.CreatedAt,
                        PinType = PinType.Catch,
                        SpeciesType = p.SpeciesType,
                        HookSize = p.HookSize,
                        BaitType = p.BaitType,
                    })
                    .FirstOrDefaultAsync(),

                PinType.Info => await _db.InfoPins
                    .Where(p => p.Id == id)
                    .Select(p => new GetPinPreviewResDTO
                    {
                        Id = p.Id,
                        Latitude = p.Latitude,
                        Longitude = p.Longitude,
                        Description = p.Description,
                        CreatedAt = p.CreatedAt,
                        PinType = PinType.Info,
                        AccessDifficulty = p.AccessDifficulty,
                        SeaBedType = p.SeaBedType
                    })
                    .FirstOrDefaultAsync(),

                PinType.Warning => await _db.WarnPins
                    .Where(p => p.Id == id)
                    .Select(p => new GetPinPreviewResDTO
                    {
                        Id = p.Id,
                        Latitude = p.Latitude,
                        Longitude = p.Longitude,
                        Description = p.Description,
                        CreatedAt = p.CreatedAt,
                        PinType = PinType.Warning,
                        WarnPinType = p.WarnPinType
                    })
                    .FirstOrDefaultAsync(),

                _ => null
            };

            if (result is null)
                return NotFound("Pin não encontrado.");

            return Ok(result);
        }




        [Authorize]
        [HttpPost("CreateCatchPin")]
        [RequestSizeLimit(5_000_000)]
        public async Task<IActionResult> CreateCatchPin(CreateCatchPinReqDTO dto)
        {

            try
            {
                var allowedTypes = new[] { "image/jpeg", "image/png" };
                string? imageUrl = null;

                if (!allowedTypes.Contains(dto.Image.ContentType))
                {
                    return BadRequest(new CreateCatchPinResDTO
                    {
                        Success = false,
                        ErrorMessage = "Invalid Image type"
                    });
                }
                else 
                {
                    imageUrl = await _blobStorage.UploadImageAsync(dto.Image);
                }

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
                    ImageUrl = imageUrl,
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
                    PinType = PinType.Warning,
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
