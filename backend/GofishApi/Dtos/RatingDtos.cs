namespace GofishApi.Dtos;

public record CreateRatingReqDTO(
    int Stars,
    string? Title,
    string? Body
);

public record CreateRatingResDTO(
    string Id
);

public record UpdateRatingReqDTO(
    int Stars,
    string? Title,
    string? Body
);

public record GetRatingResDTO(
    string UserId,
    int Stars,
    string? Title,
    string? Body,
    DateTime CreatedAt
);

public record GetRatingsResDTO(
    IEnumerable<GetRatingResDTO> Ratings
);