namespace GofishApi.Dtos;

public record SendGroupInviteReqDTO(
    int GroupId,
    string ReceiverUserId
);

public record SendGroupInviteResDTO(
    int InviteId
);