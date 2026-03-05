import { TwoFactorMethod } from "@gofish/shared/models/user-security.models"

export interface SecurityInfoReqDTO {
  // Unused
}

export interface SecurityInfoResDTO {
  twoFactorEnabled: boolean,
  twoFactorMethod: TwoFactorMethod
}

export interface ChangePasswordReqDTO {
  currentPassword: string;
  newPassword: string;
  totpCode?: string;
}

export interface ChangePasswordResDTO {
  // Unused
}

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
