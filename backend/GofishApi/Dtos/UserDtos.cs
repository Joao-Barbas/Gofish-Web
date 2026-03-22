using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record FriendshipUserDto(
    string UserId,
    string UserName,
    string FirstName,
    string LastName,
    string? AvatarUrl
)
{
    public static FriendshipUserDto FromEntity(AppUser u) => new(
        u.Id,
        u.UserName!,
        u.FirstName ?? "",
        u.LastName ?? "",
        u.UserProfile.AvatarUrl
    );
}

public record FriendshipDto(
    int Id,
    string RequesterUserId,
    string ReceiverUserId,
    FriendshipState State,
    DateTime CreatedAt,
    DateTime? RepliedAt,
    FriendshipUserDto Requester,
    FriendshipUserDto Receiver
)
{
    public static FriendshipDto FromEntity(Friendship e) => new(
        e.Id,
        e.RequesterUserId,
        e.ReceiverUserId,
        e.State,
        e.CreatedAt,
        e.RepliedAt,
        FriendshipUserDto.FromEntity(e.Requester),
        FriendshipUserDto.FromEntity(e.Receiver)
    );
}

public record GetFriendshipsReqDto(
    string? UserId          = null,
    FriendshipState? State  = null,
    int MaxResults          = 20,
    DateTime? LastTimestamp = null
)
{ }

public record GetFriendshipsResDto(
    IEnumerable<FriendshipDto> Friendships,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }

public record CreateFriendshipReqDto(
    string ReceiverId
)
{ }

public record CreateFriendshipResDto(
    // Unused
)
{ }
