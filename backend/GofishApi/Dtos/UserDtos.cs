using GofishApi.Enums;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record FriendshipDto (
    string RequesterUserId,
    string ReceiverUserId,
    FriendshipState State,
    DateTime CreatedAt,
    DateTime? RepliedAt
)
{
    public static FriendshipDto FromEntity(Friendship e) => new(
        e.RequesterUserId,
        e.ReceiverUserId,
        e.State,
        e.CreatedAt,
        e.RepliedAt
    );
}

public record GetFriendshipsReqDto(
    // Unused
)
{ }

public record GetFriendshipsResDto(
    IEnumerable<FriendshipDto> Friendships,
    bool HasMoreResults,
    DateTime? LastTimestamp
)
{ }
