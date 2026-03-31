import { PinReportReason } from "@gofish/shared/enums/pin-report-reason.enum";

export interface CreatePinReportReqDTO {
  pinId: number;
  reason: PinReportReason;
  description?: string;
}

export interface CreatePinReportResDTO {
  id: number;
}
