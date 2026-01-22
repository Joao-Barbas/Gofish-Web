export interface SignInReqDTO {
  email: string;
  password: string;
}

export interface SignInResDTO {
  success: boolean;
  token?: string;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
  errorCode?: string;
  errorDescription?: string;
}
