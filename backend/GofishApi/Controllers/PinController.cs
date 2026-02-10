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
using System;
using static GofishApi.Dtos.GetNearbyPinsResDTO;

namespace GofishApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PinController : ControllerBase
    {
        private readonly ILogger<PinController> _logger;
        private readonly AppDbContext _db;
        private readonly IBlobStorageService _blobStorage;

        public PinController(
            ILogger<PinController> logger,
            AppDbContext db,
            IBlobStorageService blobStorage
        ) {
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
        ) {
            var pins = await _db.Pins
            .Where(p =>
                (p.Latitude >= minLat && p.Latitude <= maxLat && p.Longitude >= minLng && p.Longitude <= maxLng) &&
                (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow))
            .Select(p => new NearbyPinDTO
            {
                Id = p.Id,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                CreatedAt = p.CreatedAt,
                PinType = p.PinType
            })
            .ToListAsync();
            return Ok(new GetNearbyPinsResDTO { Success = true, Pins = pins });
        }


        [Authorize]
        [HttpGet("GetPinPreview/{id}")]
        public async Task<IActionResult> GetPinPreview(int id)
        {
            var pin = await _db.Pins
            .Where(p => p.Id == id)
            .FirstOrDefaultAsync();

            if (pin == null)
            {
                return NotFound(new ApiErrorResponse
                {
                    Errors = [new("PinNotFound", "Id returned no results")]
                });
            }

            GetPinPreviewResDTO? data = pin.PinType switch
            {
                PinType.Catch => GetPinPreviewResDTO.FromCatchPin((CatchPin)pin),
                PinType.Info => GetPinPreviewResDTO.FromInfoPin((InfoPin)pin),
                PinType.Warning => GetPinPreviewResDTO.FromWarnPin((WarnPin)pin),
                _ => null
            };

            return Ok(new ApiResponse<GetPinPreviewResDTO>
            {
                Data = data
            });
        }

        #region CreatePins

        [Authorize]
        [HttpPost("CreateCatchPin")]
        [RequestSizeLimit(5_000_000)]
        public async Task<IActionResult> CreateCatchPin(CreateCatchPinReqDTO dto)
        {
            var allowedTypes = new[] { "image/jpeg", "image/png" };
            string? imageUrl = null;

            if (!allowedTypes.Contains(dto.Image.ContentType))
            {
                return BadRequest(new ApiErrorResponse
                {
                    Errors = [new("InvalidFileType", "Invalid file type")]
                });
            }
            else
            {
                try
                {
                    imageUrl = await _blobStorage.UploadImageAsync(dto.Image);
                }
                catch (Exception ex)
                {
                    return StatusCode(503, new ApiErrorResponse {
                        Errors = [new("ImageUploadFailed", ex.Message)]
                    });
                }
            }

            var pin = new CatchPin // Aqui podias criar um metodo ToCatchPin no CreateCatchPinReqDTO (Se se repetir mais que esta vez)
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
                PinType = PinType.Catch,
                SpeciesType = dto.SpeciesType,
                HookSize = dto.HookSize,
                BaitType = dto.BaitType,
                ImageUrl = imageUrl,
            };

            try
            {
                _db.Pins.Add(pin);
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(503, new ApiErrorResponse
                {
                    Errors = [new("GenericDatabaseFail", ex.Message)]
                });
            }

            return Ok(new ApiResponse<CreateCatchPinResDTO>
            {
                Data = new(Id: pin.Id)
            });
        }


        [Authorize]
        [HttpPost("CreateInfoPin")]
        public async Task<IActionResult> CreateInfoPin(CreateInfoPinReqDTO dto)
        {
            var pin = new InfoPin
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = null,
                PinType = PinType.Info,
                AccessDifficulty = dto.AccessDifficulty,
                SeaBedType = dto.SeaBedType,
            };

            try
            {
                _db.Pins.Add(pin);
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(503, new ApiErrorResponse
                {
                    Errors = [new("GenericDatabaseFail", ex.Message)]
                });
            }

            return Ok(new ApiResponse<CreateInfoPinResDTO>
            {
                Data = new(Id: pin.Id)
            });
        }

        [Authorize]
        [HttpPost("CreateWarnPin")]
        public async Task<IActionResult> CreateWarnPin(CreateWarnPinReqDTO dto)
        {
            var pin = new WarnPin
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(WarnPin.ExpiresInDays),
                PinType = PinType.Warning,
                WarnPinType = dto.WarnPinType,
            };

            try
            {
                _db.Pins.Add(pin);
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(503, new ApiErrorResponse
                {
                    Errors = [new("GenericDatabaseFail", ex.Message)]
                });
            }

            return Ok(new ApiResponse<CreateWarnPinResDTO>
            {
                Data = new(Id: pin.Id)
            });
        }

        #endregion

        [Authorize]
        [HttpDelete("DeletePin/{id}")]
        public async Task<IActionResult> DeletePin(int id)
        {
            try
            {
                var pin = await _db.Pins.FindAsync(id);
                if (pin == null)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Errors = [new("PinNotFound", "Id returned no results")]
                    });
                }
                _db.Pins.Remove(pin);
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(503, new ApiErrorResponse
                {
                    Errors = [new("GenericDatabaseFail", ex.Message)]
                });
            }
            return Ok(new ApiResponse<object>());
        }

        #region EnumeratorEndpoints

        [AllowAnonymous]
        [HttpGet("EnumeratePinType")]
        public IActionResult EnumeratePinType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<PinType>() }); }

        [AllowAnonymous]
        [HttpGet("EnumerateBaitType")]
        public IActionResult EnumerateBaitType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<BaitType>() }); }

        [AllowAnonymous]
        [HttpGet("EnumerateSeaBedType")]
        public IActionResult EnumerateSeaBedType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<SeaBedType>() }); }

        [AllowAnonymous]
        [HttpGet("EnumerateWarningType")]
        public IActionResult EnumerateWarningType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<WarningType>() }); }

        [AllowAnonymous]
        [HttpGet("EnumerateSpeciesType")]
        public IActionResult EnumerateSpeciesType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<SpeciesType>() }); }

        #endregion
    }
}
