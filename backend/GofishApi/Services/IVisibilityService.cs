using GofishApi.Models;

namespace GofishApi.Services;

public interface IVisibilityService
{
    IQueryable<string> GetFriendIds(string userId);
    IQueryable<int> GetGroupIds(string userId);
    IQueryable<int> GetVisiblePinIdsByAuthor(string authorId, string currentUserId);
    IQueryable<int> GetVisiblePinIdsByGroup(int groupId, string currentUserId);

    IQueryable<Pin> FilterFriendsPins(IQueryable<Pin> query, string userId);
    IQueryable<Pin> FilterGroupsPins(IQueryable<Pin> query, string userId);
    IQueryable<Pin> FilterVisiblePins(IQueryable<Pin> query, string userId);

    Task<bool> IsMemberOfGroup(string userId, int groupId);
    Task<bool> IsMemberOfAllGroups(string userId, IEnumerable<int> groupIds);
    Task<bool> IsFriendOf(string userId, string otherUserId);
}
