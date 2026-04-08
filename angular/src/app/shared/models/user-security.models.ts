/* user-security.models.ts */

/** @deprecated Use two-factor-method.enum.ts */
export enum TwoFactorMethod {
  None  = 0,
  Totp  = 1,
  Email = 2,
  Sms   = 3  // Not implemented
}

export interface SecurityInfo {
  identityProvider: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  emailConfirmed: boolean;
}
