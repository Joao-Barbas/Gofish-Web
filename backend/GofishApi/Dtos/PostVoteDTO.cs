using GofishApi.Enums;
using System.ComponentModel.DataAnnotations;

namespace GofishApi.Dtos;

public record VotePostDTO(
    [Required] VoteKind Value
);