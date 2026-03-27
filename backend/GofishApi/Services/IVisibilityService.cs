using GofishApi.Models;

namespace GofishApi.Services;

public interface IVisibilityService
{
    IQueryable<string> GetFriendIds(string userId);
    IQueryable<int> GetGroupIds(string userId);
    IQueryable<Pin> FilterVisiblePins(IQueryable<Pin> query, string userId);
    IQueryable<Post> FilterVisiblePosts(IQueryable<Post> query, string userId);
    Task<bool> IsMemberOfGroup(string userId, int groupId);
    Task<bool> IsMemberOfAllGroups(string userId, IEnumerable<int> groupIds);
    Task<bool> IsFriendOf(string userId, string otherUserId);
}
