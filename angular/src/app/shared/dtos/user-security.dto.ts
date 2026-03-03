import { TwoFactorMethod } from "@gofish/shared/models/user-security.models"

export interface SecurityInfoReqDTO {
  // Unused
}

export interface SecurityInfoResDTO {
  twoFactorEnabled: boolean,
  twoFactorMethod: TwoFactorMethod
}

export interface ChangePasswordReqDTO {
  currentPassword: string,
  newPassword: string,
  confirmPasswor: string
}

export interface ChangePasswordResDTO {
  // Unused
}
