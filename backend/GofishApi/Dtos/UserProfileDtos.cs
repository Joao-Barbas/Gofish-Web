using System.ComponentModel.DataAnnotations;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record GetUserProfileReqDTO(
    // Unused
)
{ }

public record GetUserProfileResDTO(
    string UserId,
    int FishingScore,
    string? Bio,
    string? AvatarUrl,
    DateTime JoinedAt,
    DateTime LastActiveAt
)
{
    public static GetUserProfileResDTO FromEntity(UserProfile e)
    {
        return new(
            e.UserId,
            e.FishingScore,
            e.Bio,
            e.AvatarUrl,
            e.JoinedAt,
            e.LastActiveAt
        );
    }
}

public record PutUserProfileReqDTO(
    [Required] string Bio,
    [Required] string AvatarUrl
)
{ }

public record PatchUserProfileReqDTO(
    string? Bio,
    string? AvatarUrl
)
{ }
