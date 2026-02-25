export enum TwoFactorMethod {
  None  = 0,
  App   = 1,
  Email = 2,
  Sms   = 3
}

export interface SecurityInfo {
  twoFactorEnabled: boolean,
  twoFactorMethod: TwoFactorMethod
}
