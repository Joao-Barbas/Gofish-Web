export enum PinReportReason {
  OffensiveContent = 0,
  Spam = 1,
  WrongLocation = 2,
  MisleadingInfo = 3,
  InappropriateImage = 4,
  FakeCatch = 5,
  IllegalActivity = 6,
  DuplicatePin = 7,
  PrivateLocation = 8,
  Other = 9
}

export const PinReportReasonLabel: Record<PinReportReason, string> = {
  [PinReportReason.OffensiveContent]: 'Offensive Content',
  [PinReportReason.Spam]: 'Spam / Advertising',
  [PinReportReason.WrongLocation]: 'Wrong Location',
  [PinReportReason.MisleadingInfo]: 'Misleading Information',
  [PinReportReason.InappropriateImage]: 'Inappropriate Image',
  [PinReportReason.FakeCatch]: 'Fake Catch',
  [PinReportReason.IllegalActivity]: 'Illegal Activity',
  [PinReportReason.DuplicatePin]: 'Duplicate Pin',
  [PinReportReason.PrivateLocation]: 'Private Location',
  [PinReportReason.Other]: 'Other'
};
