import { TwoFactorMethod } from "@gofish/shared/enums/two-factor-method.enum"

// View models

// ----

// End view models
// Request-response wrappers

export interface SecurityInfoReqDTO {
  // Unused
}
export interface SecurityInfoResDTO {
  identityProvider: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  emailConfirmed: boolean;
}

export interface ValidateTwoFactorCodeReqDTO {
  code: string;
}
export interface ValidateTwoFactorCodeResDTO {
  token: string;
}

export interface GetTotpSetupReqDTO {
  // Unused
};
export interface GetTotpSetupResDTO {
  authenticatorKey: string;
  qrCodeUri: string;
}

export interface EnableTotpReqDTO {
  totpCode: string;
}
export interface EnableTotpResDTO {
  backupCodes: string[];
}

export interface DisableTotpReqDTO {
  totpCode: string;
}
export interface DisableTotpResDTO {
  // Unused
}

export interface VerifyEmailReqDTO {
  code: string;
}
export interface VerifyEmailResDTO {
  // Unused
}

export interface InitiateEmailChangeReqDTO {
  newEmail: string;
  twoFactorToken?: string; // Required when the user has 2FA enabled
}
export interface InitiateEmailChangeResDTO {
  token: string;
}

export interface CompleteEmailChangeReqDTO {
  token: string;
  code: string;
}
export interface CompleteEmailChangeResDTO {
  // Unused
}

export interface ChangePasswordReqDTO {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
}
export interface ChangePasswordResDTO {
  // Unused
}

export interface ForgotPasswordReqDTO {
  email: string;
}
export interface ForgotPasswordResDTO { } // Unused

export interface ResetPasswordReqDTO {
  email: string;
  code: string;
  newPassword: string;
}
export interface ResetPasswordResDTO { } // Unused


// End request-response wrappers
