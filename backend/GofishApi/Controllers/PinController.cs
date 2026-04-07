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
using GofishApi.Extensions;

namespace GofishApi.Controllers;

[Authorize]
[Route("api/[controller]/[action]")]
[ApiController]
public class PinController : ControllerBase
{
    private readonly ILogger<PinController> _logger;
    private readonly IBlobStorageService _blobStorage;
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IGamificationService _gamification;
    private readonly IVisibilityService _visibility;

    public PinController(
        ILogger<PinController> logger,
        IBlobStorageService blobStorage,
        AppDbContext db,
        UserManager<AppUser> userManager,
        IGamificationService gamification,
        IVisibilityService visibility
    )
    {
        _logger = logger;
        _blobStorage = blobStorage;
        _db = db;
        _userManager = userManager;
        _gamification = gamification;
        _visibility = visibility;
    }

    [HttpGet]
    public async Task<IActionResult> GetInViewport([FromQuery] GetInViewportReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();

        IQueryable<Pin> query;

        query = _db.Pins.Where(p => p.Latitude >= dto.MinLat
            && p.Latitude <= dto.MaxLat
            && p.Longitude >= dto.MinLng
            && p.Longitude <= dto.MaxLng);
        // query = query.Where(p => p.ExpiresAt == null || p.ExpiresAt > DateTime.UtcNow);
        query = _visibility.FilterVisiblePins(query, userId);

        var pins = await query.Select(p => PinDto.FromEntity(p).SetGeolocation(p)).ToListAsync();

        return Ok(new GetInViewportResDto(pins));
    }

    [HttpPost]
    public async Task<IActionResult> GetFeed([FromBody] GetFeedReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var userId     = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        if (userId is null)
        {
            return Unauthorized();
        }

        IQueryable<Pin> query = dto.Kind switch
        {
            FeedKind.Discovery => _visibility.FilterVisiblePins(_db.Pins, userId),
            FeedKind.Friends   => _visibility.FilterFriendsPins(_db.Pins, userId),
            FeedKind.Groups    => _visibility.FilterGroupsPins(_db.Pins, userId),
            _ => throw new AppValidationException("Kind", "Feed kind must be Discovery, Friends, or Groups")
        };

        if (dto.LastTimestamp is not null)
        {
            query = query.Where(p => p.CreatedAt < dto.LastTimestamp.Value);
        }

        var pins = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(maxResults + 1)
            .Select(p => new PinDto(p.Id, p.CreatedAt, p.Visibility, p.Kind)
            {
                Geolocation = new PinGeolocationDto(p.Latitude, p.Longitude),
                Author = new PinAuthorDto
                {
                    Id = p.AppUser.Id,
                    UserName = p.AppUser.UserName ?? "",
                    FirstName = p.AppUser.FirstName ?? "",
                    LastName = p.AppUser.LastName ?? "",
                    CatchPoints = p.AppUser.UserProfile.CatchPoints,
                    Rank = GamificationService.GetRank(p.AppUser.UserProfile.CatchPoints),
                    AvatarUrl = p.AppUser.UserProfile.AvatarUrl
                },
                Details = new PinDetailsDto(
                    ((CatchPin)p).Species,
                    ((CatchPin)p).Bait,
                    ((CatchPin)p).HookSize,
                    ((InfoPin)p).AccessDifficulty,
                    ((InfoPin)p).Seabed,
                    ((WarnPin)p).WarningKind),
                Ugc = new PinUgcDto(p.Body, p.ImageUrl),
                Stats = new PinStatsDto(
                    p.Votes.Where(v => v.UserId == userId).Select(v => (VoteKind?)v.Value).FirstOrDefault(),
                    p.Score,
                    p.Comments.Count)
            })
            .ToListAsync();

        var hasMore       = pins.Count > maxResults;
        var paginatedPins = pins.Take(maxResults).ToList();
        var lastTimestamp = hasMore ? paginatedPins[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetFeedResDto(paginatedPins, hasMore, lastTimestamp));
    }

    [HttpPost]
    public async Task<IActionResult> GetPins([FromBody] GetPinsReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var userId     = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        if (userId is null)
        {
            return Unauthorized();
        }

        // Start with a database-backed query that returns nothing
        IQueryable<int> pinIdQuery = _db.Pins.Where(p => false).Select(p => p.Id);

        foreach (var id in dto.Ids)
        {
            if (id.PinId is not null)
            {
                pinIdQuery = pinIdQuery.Union(
                    _db.Pins.Where(p => p.Id == id.PinId.Value).Select(p => p.Id));
            }
            if (!string.IsNullOrEmpty(id.AuthorId))
            {
                pinIdQuery = pinIdQuery.Union(
                    _visibility.GetVisiblePinIdsByAuthor(id.AuthorId, userId));
            }
            if (id.GroupId is not null)
            {
                pinIdQuery = pinIdQuery.Union(
                    _visibility.GetVisiblePinIdsByGroup(id.GroupId.Value, userId));
            }
        }

        var req  = dto.DataRequest ?? new();
        var pins = await _visibility
            .FilterVisiblePins(_db.Pins.Where(p => pinIdQuery.Contains(p.Id)), userId)
            .Where(p => dto.LastTimestamp == null || p.CreatedAt < dto.LastTimestamp.Value)
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(maxResults + 1)
            .Select(p => new PinDto(p.Id, p.CreatedAt, p.Visibility, p.Kind)
            {
                Geolocation = req.IncludeGeolocation != true ? null : new PinGeolocationDto(
                    p.Latitude,
                    p.Longitude),

                Author = req.IncludeAuthor != true ? null : new PinAuthorDto
                {
                    Id = p.AppUser.Id,
                    UserName = p.AppUser.UserName ?? "",
                    FirstName = p.AppUser.FirstName ?? "",
                    LastName = p.AppUser.LastName ?? "",
                    CatchPoints = p.AppUser.UserProfile.CatchPoints,
                    Rank = GamificationService.GetRank(p.AppUser.UserProfile.CatchPoints),
                    AvatarUrl = p.AppUser.UserProfile.AvatarUrl
                },

                Details = req.IncludeDetails != true ? null : new PinDetailsDto(
                    ((CatchPin)p).Species,
                    ((CatchPin)p).Bait,
                    ((CatchPin)p).HookSize,
                    ((InfoPin)p).AccessDifficulty,
                    ((InfoPin)p).Seabed,
                    ((WarnPin)p).WarningKind),

                Ugc = req.IncludeUgc != true ? null : new PinUgcDto(
                    p.Body,
                    p.ImageUrl),

                Stats = req.IncludeStats != true ? null : new PinStatsDto(
                    p.Votes.Where(v => v.UserId == userId).Select(v => (VoteKind?)v.Value).FirstOrDefault(),
                    p.Score,
                    p.Comments.Count)
            })
            .ToListAsync();

        var hasMore  = pins.Count > maxResults;
        var page     = pins.Take(maxResults).ToList();
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetPinsResDto(page, hasMore, lastTime));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePin(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var pin = await _db.Pins.FindAsync(id);
        if (pin is null) return NotFound();
        var isOwner = pin.UserId == userId;
        var isAdmin = User.IsInRole("Admin");
        if (!isOwner && !isAdmin) return Forbid();
        _db.Pins.Remove(pin);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    #region Votes

    [HttpPut("{pinId}")]
    public async Task<IActionResult> PutVote([FromRoute] int pinId, [FromBody] VoteReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        if (!Enum.IsDefined(dto.Value))
        {
            throw new AppValidationException("Value", "Invalid vote value.");
        }

        var pin = await _db.Pins.FindAsync(pinId);
        if (pin is null) return NotFound();

        // if (pin.UserId == userId)
        // {
        //    throw new AppValidationException("Vote", "You cannot vote on your own pin.");
        // }

        var existingVote = await _db.Votes.FirstOrDefaultAsync(v => v.PinId == pinId && v.UserId == userId);

        if (existingVote?.Value == dto.Value)
        {
            return Ok(new VoteResDto(dto.Value, pin.Score));
        }

        var newScore = await _gamification.ApplyVoteAsync(userId, pin, dto.Value, existingVote);
        return Ok(new VoteResDto(dto.Value, newScore));
    }

    [HttpDelete("{pinId}")]
    public async Task<IActionResult> DeleteVote(int pinId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var vote = await _db.Votes.FirstOrDefaultAsync(v => v.PinId == pinId && v.UserId == userId);
        if (vote is null) return NotFound();

        var pin = await _db.Pins.FindAsync(pinId);
        if (pin is null) return NotFound();

        var newScore = await _gamification.RemoveVoteAsync(userId, pin, vote);
        return Ok(new VoteResDto(null, newScore));
    }

    /// <summary>
    /// Get authenticated user's vote and score for a pin.
    /// </summary>
    [HttpGet("{pinId}")]
    public async Task<IActionResult> GetUserVote(int pinId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var pin = await _db.Pins.FindAsync(pinId);
        if (pin is null) return NotFound();

        var userVote = await _db.Votes
            .Where(v => v.PinId == pinId && v.UserId == userId)
            .Select(v => (VoteKind?)v.Value)
            .FirstOrDefaultAsync();

        return Ok(new VoteResDto(userVote, pin.Score));
    }

    #endregion // Votes
    #region Comments

    [HttpGet]
    public async Task<IActionResult> GetComments([FromQuery] GetCommentsReqDto dto)
    {
        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        var pinExists = await _db.Pins.AnyAsync(p => p.Id == dto.PinId);

        if (!pinExists)
        {
            return NotFound();
        }

        var query = _db.Comments.Where(c => c.PinId == dto.PinId);

        if (dto.LastTimestamp is not null)
        {
            query = query.Where(c => c.CreatedAt < dto.LastTimestamp.Value);
        }

        var results = await query
            .Include(c => c.AppUser).ThenInclude(u => u.UserProfile)
            .OrderByDescending(c => c.CreatedAt)
            .ThenByDescending(c => c.Id)
            .Take(maxResults + 1)
            .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();
        var data = page.Select(CommentDto.FromEntity);
        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;

        return Ok(new GetCommentsResDto(data, hasMore, lastTime));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetComment(int id)
    {
        var comment = await _db.Comments
            .AsNoTracking()
            .Include(c => c.AppUser)
            .ThenInclude(u => u.UserProfile)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment is null)
            return NotFound();

        return Ok(CommentDto.FromEntity(comment));
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (userId is null) return Unauthorized();

        var postExists = await _db.Pins.AnyAsync(p => p.Id == dto.PinId);
        if (!postExists) return NotFound();

        var comment = new Comment
        {
            PinId     = dto.PinId,
            Body      = dto.Body,
            CreatedAt = DateTime.UtcNow,
            UserId    = userId
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        return Ok(new CreateCommentResDto(comment.Id));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var comment = await _db.Comments.FirstOrDefaultAsync(p => p.Id == id);
        if (comment is null) return NotFound();
        var isOwner = comment.UserId == userId;
        var isAdmin = User.IsInRole("Admin");
        if (!isOwner && !isAdmin) return Forbid();
        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    #endregion // Comments
    #region CreatePins

    [HttpPost]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> CreateCatchPin([FromForm] CreateCatchPinReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var allowedTypes = new[] { "image/jpeg", "image/png" };

        if (dto.GroupIds?.Any() == true)
        {
            if (dto.Visibility != VisibilityLevel.Group)
            {
                throw new AppValidationException("Visibility", "Cannot create pins on group(s) with visibility other than 'group'");
            }
            if (!await _visibility.IsMemberOfAllGroups(userId, dto.GroupIds))
            {
                throw new AppValidationException("GroupIds", "You are not a member of all specified groups.");
            }
        }
        else
        {
            if (dto.Visibility == VisibilityLevel.Group)
            {
                throw new AppValidationException("GroupIds", "A least a group is required to create a pin with group visibility");
            }
        }
        if (!allowedTypes.Contains(dto.Image.ContentType))
        {
            throw new AppValidationException("Image", "Invalid file type. Only JPEG and PNG are allowed.");
        }

        string imageUrl;

        try
        {
            imageUrl = await _blobStorage.UploadImageAsync(dto.Image);
            _logger.LogDebug("Pin image upload to blob storage successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during image upload to blob storage");
            throw new AppException(title: "Service Unavailable", status: StatusCodes.Status503ServiceUnavailable, detail: "Image upload failed.");
        }

        var pinId = await SavePinAsync(new CatchPin
        {
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(CatchPin.ExpiresInDays),
            Visibility = dto.Visibility,
            Kind = PinKind.Catch,
            UserId = userId,
            Species = dto.Species,
            Bait = dto.Bait,
            HookSize = dto.HookSize,
            Body = dto.Body,
            ImageUrl = imageUrl,
            GroupPins = ToGroupPins(dto.GroupIds)
        });

        return Ok(new CreatePinResDto(pinId));
    }

    [HttpPost]
    public async Task<IActionResult> CreateInfoPin([FromBody] CreateInfoPinReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (dto.GroupIds?.Any() == true)
        {
            if (dto.Visibility != VisibilityLevel.Group)
            {
                throw new AppValidationException("Visibility", "Cannot create pins on group(s) with visibility other than 'group'");
            }
            if (!await _visibility.IsMemberOfAllGroups(userId, dto.GroupIds))
            {
                throw new AppValidationException("GroupIds", "You are not a member of all specified groups.");
            }
        }
        else
        {
            if (dto.Visibility == VisibilityLevel.Group)
            {
                throw new AppValidationException("GroupIds", "A least a group is required to create a pin with group visibility");
            }
        }
        var pinId = await SavePinAsync(new InfoPin
        {
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            CreatedAt = DateTime.UtcNow,
            Visibility = dto.Visibility,
            Kind = PinKind.Information,
            UserId = userId,
            AccessDifficulty = dto.AccessDifficulty,
            Seabed = dto.Seabed,
            Body = dto.Body,
            GroupPins = ToGroupPins(dto.GroupIds)
        });
        return Ok(new CreatePinResDto(pinId));
    }

    [HttpPost]
    public async Task<IActionResult> CreateWarnPin([FromBody] CreateWarnPinReqDto dto)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (dto.GroupIds?.Any() == true)
        {
            if (dto.Visibility != VisibilityLevel.Group)
            {
                throw new AppValidationException("Visibility", "Cannot create pins on group(s) with visibility other than 'group'");
            }
            if (!await _visibility.IsMemberOfAllGroups(userId, dto.GroupIds))
            {
                throw new AppValidationException("GroupIds", "You are not a member of all specified groups.");
            }
        }
        else
        {
            if (dto.Visibility == VisibilityLevel.Group)
            {
                throw new AppValidationException("GroupIds", "A least a group is required to create a pin with group visibility");
            }
        }
        var pinId = await SavePinAsync(new WarnPin
        {
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(WarnPin.ExpiresInDays),
            Visibility = dto.Visibility,
            Kind = PinKind.Warning,
            UserId = userId,
            WarningKind = dto.WarningKind,
            Body = dto.Body,
            GroupPins = ToGroupPins(dto.GroupIds)
        });
        return Ok(new CreatePinResDto(pinId));
    }

    // Helpers

    private async Task<int> SavePinAsync(Pin pin)
    {
        _db.Pins.Add(pin);
        await _db.SaveChangesAsync();
        await _gamification.UpdateStreakAsync(pin.UserId);
        return pin.Id;
    }

    private static List<GroupPin> ToGroupPins(IEnumerable<int>? groupIds)
    {
        return groupIds?.Select(gId => new GroupPin { GroupId = gId }).ToList() ?? [];
    }

    #endregion
}
