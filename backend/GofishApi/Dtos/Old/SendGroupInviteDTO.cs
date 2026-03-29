namespace GofishApi.Dtos;

public record SendGroupInviteReqDTO(
    string ReceiverUserId
);

public record SendGroupInviteResDTO(
    int InviteId
);