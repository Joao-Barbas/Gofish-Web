using GofishApi.Data;
using GofishApi.Enums;
using GofishApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GofishApi.Services;

public class VisibilityService : IVisibilityService
{
    private readonly AppDbContext _db;

    public VisibilityService(
        AppDbContext db
    )
    {
        _db = db;
    }

    public IQueryable<string> GetFriendIds(string userId)
    {
        return _db.Friendships
        .Where(f => (f.RequesterUserId == userId || f.ReceiverUserId == userId) && f.State == FriendshipState.Accepted)
        .Select(f => f.RequesterUserId == userId ? f.ReceiverUserId : f.RequesterUserId);
    }

    public IQueryable<int> GetGroupIds(string userId)
    {
        return _db.GroupUsers
        .Where(gu => gu.UserId == userId)
        .Select(gu => gu.GroupId);
    }

    public IQueryable<Pin> FilterVisiblePins(IQueryable<Pin> query, string userId)
    {
        var friendIds = GetFriendIds(userId);
        var groupIds  = GetGroupIds(userId);

        return query.Where(p => p.UserId == userId
            || (p.Visibility == VisibilityLevel.Public)
            || (p.Visibility == VisibilityLevel.Friends && friendIds.Contains(p.UserId))
            || (p.Visibility == VisibilityLevel.Group && _db.GroupUsers.Any(gu => gu.UserId == p.UserId && groupIds.Contains(gu.GroupId)))
        );
    }

    public async Task<bool> IsMemberOfGroup(string userId, int groupId)
    {
        return await _db.GroupUsers.AnyAsync(gu => gu.UserId == userId && gu.GroupId == groupId);
    }

    public async Task<bool> IsMemberOfAllGroups(string userId, IEnumerable<int> groupIds)
    {
        var memberCount = await GetGroupIds(userId)
            .Where(gId => groupIds.Contains(gId))
            .CountAsync();
        return memberCount == groupIds.Count();
    }

    public async Task<bool> IsFriendOf(string userId, string otherUserId)
    {
        return await _db.Friendships.AnyAsync(f => (f.RequesterUserId == userId
            && f.ReceiverUserId == otherUserId
            || f.RequesterUserId == otherUserId
            && f.ReceiverUserId == userId)
            && f.State == FriendshipState.Accepted);
    }
}
