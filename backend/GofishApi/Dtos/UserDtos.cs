using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Dtos;

#region User

public record GetUserReqDto(
    // Unused
)
{ }

public record GetUserResDto(
    string UserName,
    string FirstName,
    string LastName
)
{
    public static GetUserResDto FromEntity(AppUser u) => new(
        u.UserName  ?? "",
        u.FirstName ?? "",
        u.LastName  ?? ""
    );
}

#endregion // User
#region Friendship

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

public record RequestFriendshipReqDto(
    string ReceiverId
)
{ }

public record RequestFriendshipResDto(
    int Id
)
{ }

#endregion // Friendship
