using System.ComponentModel.DataAnnotations;
using GofishApi.Models;

namespace GofishApi.Dtos;

public record GetUserProfileReqDTO(
    // Unused
)
{ }

public record GetUserProfileResDto(
    string UserId,
    string? FirstName,
    string? LastName,
    string? UserName,
    int FishingScore,
    string? Bio,
    string? AvatarUrl,
    DateTime JoinedAt,
    DateTime LastActiveAt
)
{
    public static GetUserProfileResDto FromEntity(UserProfile e) => new(
        e.UserId,
        e.AppUser.FirstName,
        e.AppUser.LastName,
        e.AppUser.UserName,
        e.FishingScore,
        e.Bio,
        e.AvatarUrl,
        e.JoinedAt,
        e.LastActiveAt
    );
}

public record PutUserProfileReqDto(
    [Required] string Bio,
    [Required] string AvatarUrl
)
{ }

public record PatchUserProfileReqDto(
    string? Bio,
    string? AvatarUrl
)
{ }
