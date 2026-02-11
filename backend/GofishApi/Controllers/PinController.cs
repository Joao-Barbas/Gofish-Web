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
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

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
        ){
            var pins = await _db.Pins
            .Where(p =>
                (p.Latitude >= minLat && p.Latitude <= maxLat && p.Longitude >= minLng && p.Longitude <= maxLng) &&
                (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow))
            .Select(p => new ViewportPinDTO(
                p.Id,
                p.Latitude,
                p.Longitude,
                p.CreatedAt,
                p.PinType
            ))
            .ToListAsync();
            return Ok(new ApiResponse<GetViewportPinsResDTO>
            {
                Data = new (pins)
            });
        }


        [Authorize]
        [HttpGet("GetPinPreview/{id}")]
        public async Task<IActionResult> GetPinPreview(int id)
        {
            var pin = await _db.Pins
            .Include(p => p.AppUser)
            .Include(p => p.Post)
            .FirstOrDefaultAsync(p => p.Id == id);

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
            var userIdString = User.FindFirstValue("UserId");
            if (userIdString is null)
            {
                return Unauthorized(new ApiErrorResponse
                {
                    Errors = [new("Unauthorized", "Access denied")]
                });
            }

            var userId = Guid.Parse(userIdString);
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
                    return StatusCode(503, new ApiErrorResponse
                    {
                        Errors = [new("ImageUploadFailed", ex.Message)]
                    });
                }
            }

            // Aqui podias criar um metodo ToCatchPin no CreateCatchPinReqDTO
            // Se se repetisse mais que esta vez
            var newPin = new CatchPin
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
                Visibility = dto.Visibility,
                PinType = PinType.Catch,
                UserId = userId,

                SpeciesType = dto.SpeciesType,
                BaitType = dto.BaitType,
                HookSize = dto.HookSize,

                Post = new Post
                {
                    Body = dto.Body,
                    ImageUrl = imageUrl,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                }
            };

            try
            {
                // _db.Posts.Add() and also set PinId on Post is not needed
                // Entity framework should do it correctly behind the scenes
                _db.Pins.Add(newPin);
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
                Data = new(Id: newPin.Id)
            });
        }

        [Authorize]
        [HttpPost("CreateInfoPin")]
        public async Task<IActionResult> CreateInfoPin(CreateInfoPinReqDTO dto)
        {
            var userIdString = User.FindFirstValue("UserId");
            if (userIdString is null)
            {
                return Unauthorized(new ApiErrorResponse
                {
                    Errors = [new("Unauthorized", "Access denied")]
                });
            }

            var userId = Guid.Parse(userIdString);
            var newPin = new InfoPin
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
                Visibility = dto.Visibility,
                PinType = PinType.Catch,
                UserId = userId,

                AccessDifficulty = dto.AccessDifficulty,
                SeaBedType = dto.SeaBedType,

                Post = new Post
                {
                    Body = dto.Body,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                }
            };

            try
            {
                _db.Pins.Add(newPin);
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
                Data = new(Id: newPin.Id)
            });
        }

        [Authorize]
        [HttpPost("CreateWarnPin")]
        public async Task<IActionResult> CreateWarnPin(CreateWarnPinReqDTO dto)
        {
            var userIdString = User.FindFirstValue("UserId");
            if (userIdString is null)
            {
                return Unauthorized(new ApiErrorResponse
                {
                    Errors = [new("Unauthorized", "Access denied")]
                });
            }

            var userId = Guid.Parse(userIdString);
            var newPin = new WarnPin
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
                Visibility = dto.Visibility,
                PinType = PinType.Catch,
                UserId = userId,

                WarningType = dto.WarningType,

                Post = new Post
                {
                    Body = dto.Body,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                }
            };

            try
            {
                _db.Pins.Add(newPin);
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
                Data = new(Id: newPin.Id)
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

        [AllowAnonymous]
        [HttpGet("EnumerateVisibilityType")]
        public IActionResult EnumerateVisibilityType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<VisibilityType>() }); }

        [AllowAnonymous]
        [HttpGet("EnumerateAccessDifficultyType")]
        public IActionResult EnumerateAccessDifficultyType() { return Ok(new ApiResponse<GetEnumeratorResDTO> { Data = GetEnumeratorResDTO.FromEnum<AccessDifficultyType>() }); }

        #endregion
    }
}
