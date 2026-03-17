using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GofishApi.Data;
using GofishApi.Dtos;
using GofishApi.Models;
using GofishApi.Services;
using GofishApi.Enums;
using GofishApi.Exceptions;

namespace GofishApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PinController : ControllerBase
{
    private readonly ILogger<PinController> _logger;
    private readonly IBlobStorageService _blobStorage;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public PinController(
        ILogger<PinController> logger,
        IBlobStorageService blobStorage,
        AppDbContext db,
        UserManager<AppUser> userManager
    ){
        _logger = logger;
        _blobStorage = blobStorage;
        _db = db;
        _userManager = userManager;
    }

    [Authorize]
    [HttpGet("GetInViewport")]
    public async Task<IActionResult> GetInViewport(
        [FromQuery] double minLat,
        [FromQuery] double minLng,
        [FromQuery] double maxLat,
        [FromQuery] double maxLng
    ){
        // TODO: Visibility level is not being accounted for yet
        var pins = await _db.Pins
        .Where(p =>
            (p.Latitude >= minLat && p.Latitude <= maxLat && p.Longitude >= minLng && p.Longitude <= maxLng) &&
            (p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow))
        .Select(p => new ViewportPinDTO(
            p.Id,
            p.Latitude,
            p.Longitude,
            p.CreatedAt,
            p.Visibility,
            p.Kind
        ))
        .ToListAsync();
        return Ok(new ViewportPinsResDTO(pins));
    }

    [Authorize]
    [HttpPost("GetPins")]
    public async Task<IActionResult> GetPins([FromBody] GetPinsReqDTO dto)
    {
        // TODO: Visibility level is not being accounted for yet

        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var user   = userId is null ? null : await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var pinIds = new List<int>();

        foreach (var id in dto.Ids)
        {
            if (id.PinId is not null)
            {
                pinIds.Add(id.PinId.Value);
            }
            if (id.AuthorId is not null && id.AuthorId != "")
            {
                pinIds.AddRange(await _db.Pins
                .Where(p => p.UserId == id.AuthorId)
                .Select(p => p.Id)
                .ToListAsync());
            }
            // TODO: Implement group logic when are added
        }

        var pins = await _db.Pins
        .Where((p) => pinIds.Contains(p.Id))
        .Include((p) => p.AppUser)
        .Include((p) => p.Post)
        .ToListAsync();

        var data = pins
        .Select(p => GetPinsPinDTO.FromPin(p, dto.DataRequest))
        .ToList();

        return Ok(new GetPinsResDTO(data));
    }

    #region CreatePins

    [Authorize]
    [HttpPost("CreateCatchPin")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> CreateCatchPin([FromForm] CreateCatchPinReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var allowedTypes = new[] { "image/jpeg", "image/png" };
        string imageUrl;

        if (!allowedTypes.Contains(dto.Image.ContentType))
        {
            throw new AppException("Bad Request", "Invalid file type.", StatusCodes.Status400BadRequest);
        }
        try
        {
            imageUrl = await _blobStorage.UploadImageAsync(dto.Image);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during image upload to blob storage");
            throw new AppException("Service Unavailable", "Image upload failed.", StatusCodes.Status503ServiceUnavailable);
        }

        // Aqui podias criar um metodo ToCatchPin no CreateCatchPinReqDTO
        // Se se repetisse mais que esta vez
        var newPin = new CatchPin
        {
            Latitude   = dto.Latitude,
            Longitude  = dto.Longitude,
            CreatedAt  = DateTime.UtcNow,
            ExpiresAt  = DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
            Visibility = dto.Visibility,
            Kind       = PinKind.Catch,
            UserId     = userId,

            Species  = dto.Species,
            Bait     = dto.Bait,
            HookSize = dto.HookSize,

            Post = new Post
            {
                Body      = dto.Body,
                ImageUrl  = imageUrl,
                CreatedAt = DateTime.UtcNow,
                UserId    = userId
            }
        };

        try
        {
            // _db.Posts.Add() and also set PinId on Post is not needed
            // Entity framework should do it correctly behind the scenes
            _db.Pins.Add(newPin);
            await _db.SaveChangesAsync();
        }
        catch (Exception)
        {
            throw new AppException("Service Unavailable", "Unable to save this catch pin.", StatusCodes.Status503ServiceUnavailable);
        }

        return Ok(new CreateCatchPinResDTO(newPin.Id));
    }

    [Authorize]
    [HttpPost("CreateInfoPin")]
    public async Task<IActionResult> CreateInfoPin(CreateInfoPinReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var newPin = new InfoPin
        {
            Latitude   = dto.Latitude,
            Longitude  = dto.Longitude,
            CreatedAt  = DateTime.UtcNow,
            Visibility = dto.Visibility,
            Kind       = PinKind.Information,
            UserId     = userId,

            AccessDifficulty = dto.AccessDifficulty,
            Seabed           = dto.Seabed,

            Post = new Post
            {
                Body      = dto.Body,
                CreatedAt = DateTime.UtcNow,
                UserId    = userId
            }
        };
        try
        {
            _db.Pins.Add(newPin);
            await _db.SaveChangesAsync();
        }
        catch (Exception)
        {
            throw new AppException("Service Unavailable", "Unable to save this information pin.", StatusCodes.Status503ServiceUnavailable);
        }
        return Ok(new CreateInfoPinResDTO(newPin.Id));
    }

    [Authorize]
    [HttpPost("CreateWarnPin")]
    public async Task<IActionResult> CreateWarnPin(CreateWarnPinReqDTO dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var newPin = new WarnPin
        {
            Latitude   = dto.Latitude,
            Longitude  = dto.Longitude,
            CreatedAt  = DateTime.UtcNow,
            ExpiresAt  = DateTime.UtcNow.AddDays(WarnPin.ExpiresInDays),
            Visibility = dto.Visibility,
            Kind       = PinKind.Warning,
            UserId     = userId,

            WarningKind = dto.WarningKind,
            
            Post = new Post
            {
                Body      = dto.Body,
                CreatedAt = DateTime.UtcNow,
                UserId    = userId
            }
        };
        try
        {
            _db.Pins.Add(newPin);
            await _db.SaveChangesAsync();
        }
        catch (Exception)
        {
            throw new AppException("Service Unavailable", "Unable to save this warning pin.", StatusCodes.Status503ServiceUnavailable);
        }
        return Ok(new CreateWarnPinResDTO(newPin.Id));
    }

    #endregion

    [Authorize]
    [HttpDelete("DeletePin/{id}")]
    public async Task<IActionResult> DeletePin(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var pin = await _db.Pins.FindAsync(id);
        if (pin is null) return NotFound();
        var isOwner = pin.UserId == userId;
        var isAdmin = User.IsInRole("Admin");
        if (!isOwner || !isAdmin) return Forbid();
        _db.Pins.Remove(pin);         
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
