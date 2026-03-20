// two-factor-method.enum.ts

// TODO: Remove the duplicate at user-security.models.ts

export enum TwoFactorMethod {
  None  = 0,
  Totp  = 1,
  Email = 2,
  Sms   = 3  // Just here. Won't implement
}
