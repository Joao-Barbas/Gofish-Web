export enum CommentReportReason {
  Spam = 0,
  Inappropriate = 1,
  Harassment = 2,
  Missinformation = 3,
  OffTopic = 4,
}

export const CommentReportReasonLabel: Record<CommentReportReason, string> = {
  [CommentReportReason.Spam]: 'Spam',
  [CommentReportReason.Inappropriate]: 'Inappropriate Content',
  [CommentReportReason.Harassment]: 'Harassment or Bullying',
  [CommentReportReason.Missinformation]: 'Misinformation',
  [CommentReportReason.OffTopic]: 'Off-topic',
};
