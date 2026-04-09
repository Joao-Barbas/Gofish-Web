using FluentAssertions;
using GofishApi.Data;
using GofishApi.Enums;
using GofishApi.Models;
using GofishApi.Services;
using GofishApi.Tests.Fixtutes;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GofishApi.Tests.Services;

public class VisibilityServiceTests
{
    private readonly AppDbContext _db;
    private readonly VisibilityService _service;

    public VisibilityServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(dbOptions);
        _service = new VisibilityService(_db);
    }

    [Fact]
    public async Task GetFriendIds_WhenUserHasAcceptedFriendships_ReturnsFriendIds()
    {
        _db.Friendships.AddRange(
            new Friendship
            {
                CreatedAt = DateTime.UtcNow,
                RequesterUserId = "user-1",
                ReceiverUserId = "user-2",
                State = FriendshipState.Accepted
            },
            new Friendship
            {
                CreatedAt = DateTime.UtcNow,
                RequesterUserId = "user-3",
                ReceiverUserId = "user-1",
                State = FriendshipState.Accepted
            },
            new Friendship
            {
                CreatedAt = DateTime.UtcNow,
                RequesterUserId = "user-1",
                ReceiverUserId = "user-4",
                State = FriendshipState.Pending
            });

        await _db.SaveChangesAsync();

        var result = await _service.GetFriendIds("user-1").ToListAsync();

        result.Should().BeEquivalentTo(["user-2", "user-3"]);
    }

    [Fact]
    public async Task GetGroupIds_WhenUserBelongsToGroups_ReturnsGroupIds()
    {
        _db.GroupUsers.AddRange(
            new GroupUser { UserId = "user-1", GroupId = 10, Role = GroupRole.Member },
            new GroupUser { UserId = "user-1", GroupId = 20, Role = GroupRole.Member },
            new GroupUser { UserId = "user-2", GroupId = 30, Role = GroupRole.Member });

        await _db.SaveChangesAsync();

        var result = await _service.GetGroupIds("user-1").ToListAsync();

        result.Should().BeEquivalentTo([10, 20]);
    }

    [Fact]
    public async Task FilterFriendsPins_ReturnsOwnPins_AndFriendsPublicOrFriendsPins()
    {
        _db.Friendships.Add(new Friendship
        {
            CreatedAt = DateTime.UtcNow,
            RequesterUserId = "user-1",
            ReceiverUserId = "friend-1",
            State = FriendshipState.Accepted
        });

        await _db.SaveChangesAsync();

        var ownPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "user-1",
            visibility: VisibilityLevel.Group);

        var friendPublicPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "friend-1",
            visibility: VisibilityLevel.Public);

        var friendFriendsPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "friend-1",
            visibility: VisibilityLevel.Friends);

        var friendGroupPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "friend-1",
            visibility: VisibilityLevel.Group);

        var strangerPublicPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "stranger-1",
            visibility: VisibilityLevel.Public);

        var result = await _service.FilterFriendsPins(_db.Pins, "user-1")
            .Select(p => p.Id)
            .ToListAsync();

        result.Should().Contain(ownPin.Id);
        result.Should().Contain(friendPublicPin.Id);
        result.Should().Contain(friendFriendsPin.Id);
        result.Should().NotContain(friendGroupPin.Id);
        result.Should().NotContain(strangerPublicPin.Id);
    }

    [Fact]
    public async Task FilterGroupsPins_ReturnsOwnPins_AndPinsFromUserGroups()
    {
        var group = new Group
        {
            CreatedAt = DateTime.UtcNow,
            NormalizedName = "TEST-GROUP",
            Name = "Test Group"
        };

        _db.Groups.Add(group);
        await _db.SaveChangesAsync();

        _db.GroupUsers.Add(new GroupUser
        {
            UserId = "user-1",
            GroupId = group.Id,
            Role = GroupRole.Member
        });

        await _db.SaveChangesAsync();

        var ownPin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "user-1");
        var groupPin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "other-user");
        var outsidePin = await PinSeedFixture.CreateInfoPinAsync(_db, userId: "outside-user");

        groupPin.Groups.Add(group);
        await _db.SaveChangesAsync();

        var result = await _service.FilterGroupsPins(_db.Pins, "user-1")
            .Select(p => p.Id)
            .ToListAsync();

        result.Should().Contain(ownPin.Id);
        result.Should().Contain(groupPin.Id);
        result.Should().NotContain(outsidePin.Id);
    }

    [Fact]
    public async Task FilterVisiblePins_ReturnsOwnPublicFriendsAndSharedGroupAuthorPins()
    {
        _db.Friendships.Add(new Friendship
        {
            CreatedAt = DateTime.UtcNow,
            RequesterUserId = "user-1",
            ReceiverUserId = "friend-1",
            State = FriendshipState.Accepted
        });

        var sharedGroup = new Group
        {
            CreatedAt = DateTime.UtcNow,
            NormalizedName = "SHARED-GROUP",
            Name = "Shared Group"
        };

        _db.Groups.Add(sharedGroup);
        await _db.SaveChangesAsync();

        _db.GroupUsers.AddRange(
            new GroupUser
            {
                UserId = "user-1",
                GroupId = sharedGroup.Id,
                Role = GroupRole.Member
            },
            new GroupUser
            {
                UserId = "group-author",
                GroupId = sharedGroup.Id,
                Role = GroupRole.Member
            });

        await _db.SaveChangesAsync();

        var ownPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "user-1",
            visibility: VisibilityLevel.Group);

        var publicPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "public-author",
            visibility: VisibilityLevel.Public);

        var friendsPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "friend-1",
            visibility: VisibilityLevel.Friends);

        var groupPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "group-author",
            visibility: VisibilityLevel.Group);

        var hiddenFriendsPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "not-friend",
            visibility: VisibilityLevel.Friends);

        var hiddenGroupPin = await PinSeedFixture.CreateInfoPinAsync(
            _db,
            userId: "not-in-group",
            visibility: VisibilityLevel.Group);

        var result = await _service.FilterVisiblePins(_db.Pins, "user-1")
            .Select(p => p.Id)
            .ToListAsync();

        result.Should().Contain(ownPin.Id);
        result.Should().Contain(publicPin.Id);
        result.Should().Contain(friendsPin.Id);
        result.Should().Contain(groupPin.Id);
        result.Should().NotContain(hiddenFriendsPin.Id);
        result.Should().NotContain(hiddenGroupPin.Id);
    }

    [Fact]
    public async Task IsMemberOfGroup_WhenMembershipExists_ReturnsTrue()
    {
        _db.GroupUsers.Add(new GroupUser
        {
            UserId = "user-1",
            GroupId = 5,
            Role = GroupRole.Member
        });

        await _db.SaveChangesAsync();

        var result = await _service.IsMemberOfGroup("user-1", 5);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsMemberOfGroup_WhenMembershipDoesNotExist_ReturnsFalse()
    {
        var result = await _service.IsMemberOfGroup("user-1", 5);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsMemberOfAllGroups_WhenUserBelongsToAllGroups_ReturnsTrue()
    {
        _db.GroupUsers.AddRange(
            new GroupUser { UserId = "user-1", GroupId = 1, Role = GroupRole.Member },
            new GroupUser { UserId = "user-1", GroupId = 2, Role = GroupRole.Member },
            new GroupUser { UserId = "user-1", GroupId = 3, Role = GroupRole.Member });

        await _db.SaveChangesAsync();

        var result = await _service.IsMemberOfAllGroups("user-1", [1, 2]);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsMemberOfAllGroups_WhenUserMissesOneGroup_ReturnsFalse()
    {
        _db.GroupUsers.AddRange(
            new GroupUser { UserId = "user-1", GroupId = 1, Role = GroupRole.Member },
            new GroupUser { UserId = "user-1", GroupId = 2, Role = GroupRole.Member });

        await _db.SaveChangesAsync();

        var result = await _service.IsMemberOfAllGroups("user-1", [1, 2, 3]);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsFriendOf_WhenAcceptedFriendshipExists_ReturnsTrue()
    {
        _db.Friendships.Add(new Friendship
        {
            CreatedAt = DateTime.UtcNow,
            RequesterUserId = "user-1",
            ReceiverUserId = "user-2",
            State = FriendshipState.Accepted
        });

        await _db.SaveChangesAsync();

        var result = await _service.IsFriendOf("user-1", "user-2");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsFriendOf_WhenFriendshipIsPending_ReturnsFalse()
    {
        _db.Friendships.Add(new Friendship
        {
            CreatedAt = DateTime.UtcNow,
            RequesterUserId = "user-1",
            ReceiverUserId = "user-2",
            State = FriendshipState.Pending
        });

        await _db.SaveChangesAsync();

        var result = await _service.IsFriendOf("user-1", "user-2");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsFriendOf_WhenNoFriendshipExists_ReturnsFalse()
    {
        var result = await _service.IsFriendOf("user-1", "user-2");

        result.Should().BeFalse();
    }
}