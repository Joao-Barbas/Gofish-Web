using GofishApi.Enums;

namespace GofishApi.Dtos;


public record CreateGroupReqDTO(
    IFormFile Image,
    string Name,
    string Description
);

public record CreateGroupResDTO(
    int Id
);

