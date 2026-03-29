using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Dtos;

public record VotePostReqDTO(
    [Required] VoteKind Value
);

public record VotePostResDTO(
    int Score
);