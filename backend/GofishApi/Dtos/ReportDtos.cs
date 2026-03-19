using GofishApi.Enums;

namespace GofishApi.Dtos;

public record CreatePinReportReqDTO(
    int PinId,
    PinReportReason Reason,
    string? Description
);

public record CreatePinReportResDTO(
    int Id
);
