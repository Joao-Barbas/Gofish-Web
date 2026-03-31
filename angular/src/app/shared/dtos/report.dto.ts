import { CommentReportReason } from "@gofish/shared/enums/comment-report-reason.enum";
import { PinReportReason } from "@gofish/shared/enums/pin-report-reason.enum";

export interface CreatePinReportReqDTO {
  pinId: number;
  reason: PinReportReason;
  description?: string;
}

export interface CreatePinReportResDTO {
  id: number;
}


export interface CreateCommentReportReqDTO {
  commentId: number;
  reason: CommentReportReason;
  description?: string;
}

export interface CreateCommentReportResDTO {
  id: number;
}
