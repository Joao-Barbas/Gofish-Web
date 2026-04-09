using FluentAssertions;
using GofishApi.Data;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Options;
using GofishApi.Services;
using GofishApi.Tests.Fixtutes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace GofishApi.Tests.Services;

public class GamificationServiceTests
{
    private readonly GamificationOptions _gamificationOptions = new()
    {
        UpvotePointGain = 5,
        DownvotePointLoss = 2
    };

    private readonly AppDbContext _db;
    private readonly GamificationService _service;

    public GamificationServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _db = new AppDbContext(dbOptions);

        _service = new GamificationService(CreateOptions(), _db);
    }

    private IOptions<GamificationOptions> CreateOptions()
    {
        var optionsMock = new Mock<IOptions<GamificationOptions>>();
        optionsMock.Setup(x => x.Value).Returns(_gamificationOptions);
        return optionsMock.Object;
    }

    #region Points

    [Fact]
    public async Task TryGetPoints_WhenProfileExists_ReturnsPoints()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-1",
            CatchPoints = 10
        });

        await _db.SaveChangesAsync();

        var result = await _service.TryGetPoints("user-1");

        result.Should().Be(10);
    }

    [Fact]
    public async Task TryGetPoints_WhenUserDoesNotExist_ReturnsNull()
    {
        var result = await _service.TryGetPoints("unknown-user");

        result.Should().BeNull();
    }

    [Fact]
    public async Task ApplyUserPoints_WhenUserExists_AddsPoints()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-1",
            CatchPoints = 10
        });

        await _db.SaveChangesAsync();

        var result = await _service.ApplyUserPoints("user-1", 5);

        result.Succeeded.Should().BeTrue();

        var profile = await _db.UserProfiles.FindAsync("user-1");
        profile!.CatchPoints.Should().Be(15);
    }

    [Fact]
    public async Task ApplyUserPoints_WhenUserDoesNotExist_ReturnsFailed()
    {
        var result = await _service.ApplyUserPoints("unknown-user", 5);

        result.Succeeded.Should().BeFalse();
        result.Error.Should().Be("Unable to find user.");
    }

    [Fact]
    public async Task TryDecrementPoints_WhenEnoughPoints_DecrementsPoints()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-1",
            CatchPoints = 20
        });

        await _db.SaveChangesAsync();

        var result = await _service.TryDecrementPoints("user-1", 5);

        result.Succeeded.Should().BeTrue();

        var profile = await _db.UserProfiles.FindAsync("user-1");
        profile!.CatchPoints.Should().Be(15);
    }

    [Fact]
    public async Task TryDecrementPoints_WhenNotEnoughPoints_ReturnsFailed()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-1",
            CatchPoints = 3
        });

        await _db.SaveChangesAsync();

        var result = await _service.TryDecrementPoints("user-1", 5);

        result.Succeeded.Should().BeFalse();
        result.Error.Should().Be("You don't have enough catch points.");

        var profile = await _db.UserProfiles.FindAsync("user-1");
        profile!.CatchPoints.Should().Be(3); // não mudou
    }

    [Fact]
    public async Task TryDecrementPoints_WhenUserDoesNotExist_ReturnsFailed()
    {
        var result = await _service.TryDecrementPoints("unknown-user", 5);

        result.Succeeded.Should().BeFalse();
        result.Error.Should().Be("Unable to find user.");
    }

    #endregion

    #region Voting

    [Fact]
    public async Task ApplyVoteAsync_WhenNewUpvote_AddsVote_UpdatesPinScore_AndOwnerPoints()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "owner-1",
            CatchPoints = 10
        });
        await _db.SaveChangesAsync();

        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");

        var result = await _service.ApplyVoteAsync("voter-1", pin, VoteKind.Upvote, null);

        result.Should().Be(1);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile!.CatchPoints.Should().Be(15);

        var savedVote = await _db.Votes.FirstOrDefaultAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        savedVote.Should().NotBeNull();
        savedVote!.Value.Should().Be(VoteKind.Upvote);

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(1);
    }

    [Fact]
    public async Task ApplyVoteAsync_WhenNewDownvote_AddsVote_UpdatesPinScore_AndOwnerPoints()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "owner-1",
            CatchPoints = 10
        });
        await _db.SaveChangesAsync();

        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");

        var result = await _service.ApplyVoteAsync("voter-1", pin, VoteKind.Downvote, null);

        result.Should().Be(-1);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile!.CatchPoints.Should().Be(8);

        var savedVote = await _db.Votes.FirstOrDefaultAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        savedVote.Should().NotBeNull();
        savedVote!.Value.Should().Be(VoteKind.Downvote);

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(-1);
    }

    [Fact]
    public async Task ApplyVoteAsync_WhenSwitchingFromUpvoteToDownvote_ReversesPreviousEffect()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "owner-1",
            CatchPoints = 20
        });
        await _db.SaveChangesAsync();

        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");
        pin.Score = 1;
        await _db.SaveChangesAsync();

        var existingVote = new Vote
        {
            PinId = pin.Id,
            UserId = "voter-1",
            Value = VoteKind.Upvote,
            CreatedAt = DateTime.UtcNow
        };

        _db.Votes.Add(existingVote);
        await _db.SaveChangesAsync();

        var result = await _service.ApplyVoteAsync("voter-1", pin, VoteKind.Downvote, existingVote);

        result.Should().Be(-1);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile!.CatchPoints.Should().Be(13);

        var savedVote = await _db.Votes.FirstAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        savedVote.Value.Should().Be(VoteKind.Downvote);

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(-1);
    }

    [Fact]
    public async Task ApplyVoteAsync_WhenSwitchingFromDownvoteToUpvote_ReversesPreviousEffect()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "owner-1",
            CatchPoints = 10
        });
        await _db.SaveChangesAsync();

        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");
        pin.Score = -1;
        await _db.SaveChangesAsync();

        var existingVote = new Vote
        {
            PinId = pin.Id,
            UserId = "voter-1",
            Value = VoteKind.Downvote,
            CreatedAt = DateTime.UtcNow
        };

        _db.Votes.Add(existingVote);
        await _db.SaveChangesAsync();

        var result = await _service.ApplyVoteAsync("voter-1", pin, VoteKind.Upvote, existingVote);

        result.Should().Be(1);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile!.CatchPoints.Should().Be(17);

        var savedVote = await _db.Votes.FirstAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        savedVote.Value.Should().Be(VoteKind.Upvote);

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(1);
    }

    [Fact]
    public async Task RemoveVoteAsync_WhenRemovingUpvote_ReversesEffects()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "owner-1",
            CatchPoints = 15
        });
        await _db.SaveChangesAsync();

        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");
        pin.Score = 1;
        await _db.SaveChangesAsync();

        var existingVote = new Vote
        {
            PinId = pin.Id,
            UserId = "voter-1",
            Value = VoteKind.Upvote,
            CreatedAt = DateTime.UtcNow
        };

        _db.Votes.Add(existingVote);
        await _db.SaveChangesAsync();

        var result = await _service.RemoveVoteAsync("voter-1", pin, existingVote);

        result.Should().Be(0);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile!.CatchPoints.Should().Be(10);

        var voteExists = await _db.Votes.AnyAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        voteExists.Should().BeFalse();

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(0);
    }

    [Fact]
    public async Task RemoveVoteAsync_WhenRemovingDownvote_ReversesEffects()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "owner-1",
            CatchPoints = 8
        });
        await _db.SaveChangesAsync();

        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");
        pin.Score = -1;
        await _db.SaveChangesAsync();

        var existingVote = new Vote
        {
            PinId = pin.Id,
            UserId = "voter-1",
            Value = VoteKind.Downvote,
            CreatedAt = DateTime.UtcNow
        };

        _db.Votes.Add(existingVote);
        await _db.SaveChangesAsync();

        var result = await _service.RemoveVoteAsync("voter-1", pin, existingVote);

        result.Should().Be(0);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile!.CatchPoints.Should().Be(10);

        var voteExists = await _db.Votes.AnyAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        voteExists.Should().BeFalse();

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(0);
    }

    [Fact]
    public async Task ApplyVoteAsync_WhenOwnerProfileDoesNotExist_OnlyUpdatesVoteAndPinScore()
    {
        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");

        var result = await _service.ApplyVoteAsync("voter-1", pin, VoteKind.Upvote, null);

        result.Should().Be(1);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile.Should().BeNull();

        var savedVote = await _db.Votes.FirstOrDefaultAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        savedVote.Should().NotBeNull();

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(1);
    }

    [Fact]
    public async Task RemoveVoteAsync_WhenOwnerProfileDoesNotExist_OnlyUpdatesPinScore()
    {
        var pin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "owner-1");
        pin.Score = 1;
        await _db.SaveChangesAsync();

        var existingVote = new Vote
        {
            PinId = pin.Id,
            UserId = "voter-1",
            Value = VoteKind.Upvote,
            CreatedAt = DateTime.UtcNow
        };

        _db.Votes.Add(existingVote);
        await _db.SaveChangesAsync();

        var result = await _service.RemoveVoteAsync("voter-1", pin, existingVote);

        result.Should().Be(0);

        var ownerProfile = await _db.UserProfiles.FindAsync("owner-1");
        ownerProfile.Should().BeNull();

        var voteExists = await _db.Votes.AnyAsync(v =>
            v.PinId == pin.Id && v.UserId == "voter-1");

        voteExists.Should().BeFalse();

        var savedPin = await _db.Pins.FindAsync(pin.Id);
        savedPin!.Score.Should().Be(0);
    }

    #endregion

    #region Streak 

    [Fact]
    public async Task UpdateStreakAsync_WhenUserProfileDoesNotExist_DoesNothing()
    {
        var act = async () => await _service.UpdateStreakAsync("unknown-user");

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task UpdateStreakAsync_WhenFirstPinInStreak_SetsWeeklyStreakToOne_AndMaxWeeklyStreakToOne()
    {
        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-1",
            WeeklyStreak = 0,
            MaxWeeklyStreak = 0,
            LastPinWeekStart = null
        });

        await _db.SaveChangesAsync();

        await _service.UpdateStreakAsync("user-1");

        var profile = await _db.UserProfiles.FindAsync("user-1");

        profile.Should().NotBeNull();
        profile!.WeeklyStreak.Should().Be(1);
        profile.MaxWeeklyStreak.Should().Be(1);
        profile.LastPinWeekStart.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateStreakAsync_WhenLastPinWasNotLastWeek_ResetsWeeklyStreakToOne()
    {
        var olderWeekStart = GetWeekStartForTest(DateTime.UtcNow.AddDays(-14));

        _db.UserProfiles.Add(new UserProfile
        {
            UserId = "user-1",
            WeeklyStreak = 4,
            MaxWeeklyStreak = 6,
            LastPinWeekStart = olderWeekStart
        });

        await _db.SaveChangesAsync();

        await _service.UpdateStreakAsync("user-1");

        var profile = await _db.UserProfiles.FindAsync("user-1");

        profile.Should().NotBeNull();
        profile!.WeeklyStreak.Should().Be(1);
        profile.MaxWeeklyStreak.Should().Be(6);
        profile.LastPinWeekStart.Should().Be(GetWeekStartForTest(DateTime.UtcNow));
    }

    private static DateTime GetWeekStartForTest(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }
    #endregion
}