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
using Microsoft.Extensions.Hosting;
using System.Net.NetworkInformation;
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
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        if (userId is null) return Unauthorized();

        var maxResults = Math.Clamp(dto.MaxResults, 1, 100);
        IQueryable<Pin> query = dto.Kind switch
        {
            FeedKind.Discovery => _visibility.FilterVisiblePins(_db.Pins, userId),
            FeedKind.Friends => GetFriendsFeed(_db.Pins, userId),
            FeedKind.Groups => GetGroupsFeed(_db.Pins, userId),
            _ => throw new AppValidationException("UnknownFeedKind", "Feed kind must be Discovery, Friends, or Groups")
        };

        if (dto.LastTimestamp is not null)
        {
            query = query.Where(p => p.CreatedAt < dto.LastTimestamp.Value);
        }

        query = query.Include(p => p.Votes);
        query = query.Include(p => p.AppUser)
            .ThenInclude(u => u.UserProfile);
        query = query.Include(p => p.Comments)
            .ThenInclude(c => c.AppUser)      // TODO: Are these necessary?
            .ThenInclude(u => u.UserProfile); // TODO: Are these necessary?
        query = query.Include(p => p.Groups);

        query = query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(maxResults + 1);

        var pins = await query.Select(p => PinDto.FromEntity(p)
            .SetGeolocation(p)
            .SetAuthor(p.AppUser, p.AppUser.UserProfile)
            .SetDetails(p)
            .SetUgc(p)
            .SetStats(new(
                p.Votes.Where(v => v.UserId == userId).Select(v => (VoteKind?)v.Value).FirstOrDefault(),
                p.Votes.Sum(v => (int)v.Value),
                p.Comments.Count)))
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
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;

        if (userId is null)
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
                pinIds.AddRange(await GetVisiblePinIdsByAuthor(id.AuthorId, userId));
            }
            if (id.GroupId is not null)
            {
                pinIds.AddRange(await GetVisiblePinIdsByGroup(id.GroupId.Value, userId));
            }
        }

        var query = _visibility.FilterVisiblePins(_db.Pins.Where(p => pinIds.Distinct().Contains(p.Id)), userId);

        if (dto.LastTimestamp is not null)
        {
            query = query.Where(p => p.CreatedAt < dto.LastTimestamp.Value);
        }
        if (dto.DataRequest?.IncludeGeolocation is true) { }
        if (dto.DataRequest?.IncludeAuthor is true)
        {
            query = query.Include(p => p.AppUser).ThenInclude(p => p.UserProfile);
        }
        if (dto.DataRequest?.IncludeDetails is true) { }
        if (dto.DataRequest?.IncludeStats is true)
        {
            query = query.Include(p => p.Votes);
            query = query.Include(p => p.Comments);
        }
        if (dto.DataRequest?.IncludeUgc is true) { }
        if (dto.DataRequest?.IncludeGroups is true)
        {
            query = query.Include(p => p.Groups);
        }

        var results = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(maxResults + 1)
            .ToListAsync();

        var hasMore = results.Count > maxResults;
        var page = results.Take(maxResults).ToList();

        var req = dto.DataRequest;
        var data = page.Select(p =>
        {
            var pin = PinDto.FromEntity(p);

            if (req?.IncludeGeolocation is true)
            {
                pin = pin.SetGeolocation(p);
            }
            if (req?.IncludeAuthor is true)
            {
                pin = pin.SetAuthor(p.AppUser, p.AppUser.UserProfile);
            }
            if (req?.IncludeDetails is true)
            {
                pin = pin.SetDetails(p);
            }
            if (req?.IncludeUgc is true)
            {
                pin = pin.SetUgc(p);
            }
            if (req?.IncludeStats is true)
            {
                pin = pin.SetStats(new(
                    p.Votes.Where(v => v.UserId == userId).Select(v => (VoteKind?)v.Value).FirstOrDefault(),
                    p.Votes.Sum(v => (int)v.Value),
                    p.Comments.Count));
            }

            return pin;
        }).ToList();

        var lastTime = hasMore ? page[^1].CreatedAt : (DateTime?)null;
        return Ok(new GetPinsResDto(data, hasMore, lastTime));
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

        var pinExists = await _db.Pins.AnyAsync(p => p.Id == pinId);
        if (!pinExists) return NotFound();
        if (!Enum.IsDefined(dto.Value)) throw new AppValidationException("Value", "Invalid vote value.");

        var existingVote = await _db.Votes.FirstOrDefaultAsync(v => v.PinId == pinId && v.UserId == userId);
        if (existingVote is not null)
        {
            existingVote.Value = dto.Value;
        }
        else
        {
            _db.Votes.Add(new Vote
            {
                PinId     = pinId,
                UserId    = userId,
                Value     = dto.Value,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        var score = await _db.Votes.Where(v => v.PinId == pinId).SumAsync(v => (int)v.Value);
        return Ok(new VoteResDto(dto.Value, score));
    }

    [HttpDelete("{pinId}")]
    public async Task<IActionResult> DeleteVote(int pinId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var vote = await _db.Votes.FirstOrDefaultAsync(v => v.PinId == pinId && v.UserId == userId);
        if (vote is null) return NotFound();
        _db.Votes.Remove(vote);
        await _db.SaveChangesAsync();
        var score = await _db.Votes.Where(v => v.PinId == pinId).SumAsync(v => (int)v.Value);
        return Ok(new VoteResDto(null, score));
    }

    /// <summary>
    /// Get authenticated user's vote and score
    /// </summary>
    [HttpGet("{pinId}")]
    public async Task<IActionResult> GetUserVote(int pinId)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var pinExists = await _db.Pins.AnyAsync(p => p.Id == pinId);

        if (!pinExists)
        {
            return NotFound();
        }

        var userVote = await _db.Votes
            .Where(v => v.PinId == pinId && v.UserId == userId)
            .Select(v => (VoteKind?)v.Value)
            .FirstOrDefaultAsync();

        var score = await _db.Votes
            .Where(v => v.PinId == pinId)
            .SumAsync(v => (int)v.Value);

        return Ok(new VoteResDto(userVote, score));
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

    #endregion
    #region Helpers

    // private static IQueryable<Pin> ApplyIncludes(IQueryable<Pin> query, PostDataRequestDTO? request)
    // {
    //     // Pin is always needed for visibility, kind, and pin-specific fields
    // 
    //     // query = query.Include(p => p.Votes);
    // 
    //     // if (request?.IncludeAuthor ?? false)
    //     //     query = query.Include(p => p.AppUser);
    //     // if (request?.IncludeComments ?? false)
    //     //     query = query.Include(p => p.Comments).ThenInclude(c => c.AppUser).ThenInclude(u => u.UserProfile);
    //     // if (request?.IncludeGroups ?? false)
    //     //     query = query.Include(p => p.Groups);
    // 
    //     return query;
    // }

    private IQueryable<Pin> GetFriendsFeed(IQueryable<Pin> query, string userId)
    {
        var friendIds = _visibility.GetFriendIds(userId);
        return query.Where(p => p.UserId == userId
            || (friendIds.Contains(p.UserId)
            && (p.Visibility == VisibilityLevel.Public || p.Visibility == VisibilityLevel.Friends)));
    }

    private IQueryable<Pin> GetGroupsFeed(IQueryable<Pin> query, string userId)
    {
        var groupIds = _visibility.GetGroupIds(userId);
        return query.Where(p => p.UserId == userId
            || p.Groups.Any(g => groupIds.Contains(g.Id)));
    }

    private async Task<List<int>> GetVisiblePinIdsByAuthor(string authorId, string currentUserId)
    {
        return await _visibility
            .FilterVisiblePins(_db.Pins
                .Where(p => p.UserId == authorId), currentUserId)
            .Select(p => p.Id)
            .ToListAsync();
    }

    private async Task<List<int>> GetVisiblePinIdsByGroup(int groupId, string currentUserId)
    {
        return await _visibility
            .FilterVisiblePins(_db.Pins
                .Where(p => p.Groups
                .Any(g => g.Id == groupId)), currentUserId)
            .Select(p => p.Id)
            .ToListAsync();
    }

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

    #endregion // Helpers
}
