export enum TwoFactorMethod {
  None  = 0,
  Totp  = 1,
  Email = 2,
  Sms   = 3  // Not implemented
}

export interface SecurityInfo {
  twoFactorEnabled: boolean,
  twoFactorMethod: TwoFactorMethod
}
