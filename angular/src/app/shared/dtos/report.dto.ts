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

export interface GetReportResDTO {
  id: number;
  userId: string;
  type: string;
  targetId: number;
  reasonText: string;
  description?: string;
  createdAt: string;
}

export interface GetReportReqDTO {
  maxResults: number;
  lastCreatedAt?: string;
}

export interface GetReportsResDTO {
  reports: GetReportResDTO[];
  hasMoreResults: boolean;
  lastCreatedAt?: string;
}
