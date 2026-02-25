import { SecurityInfo } from "@gofish/shared/models/user-security.models";

export interface SecurityInfoResDTO {
  success: boolean;
  data?: SecurityInfo;
  errors?: {
    code: string;
    description: string;
  }[]
}

export interface ChangePasswordReqDTO {
  currentPassword: string,
  newPassword: string,
  confirmPasswor: string
}

export interface ChangePasswordResDTO {
  success: boolean;
  errors?: {
    code: string;
    description: string;
  }[]
}
