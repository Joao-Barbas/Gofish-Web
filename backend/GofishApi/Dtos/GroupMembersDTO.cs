namespace GofishApi.Dtos;

public record AddGroupMemberReqDTO(
    int GroupId,
    string UserId,
    int RoleId = 3
);

public record AddGroupMemberResDTO(
    int GroupId,
    string UserId,
    int RoleId
);

public record RemoveGroupMemberReqDTO(
    int GroupId,
    string UserId
);

public record RemoveGroupMemberResDTO(
    int GroupId,
    string UserId
);