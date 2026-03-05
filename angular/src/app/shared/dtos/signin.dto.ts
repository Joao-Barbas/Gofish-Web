export interface SignInReqDTO {
  emailOrUserName: string;
  password: string;
}

export interface SignInResDTO {
  token?: string;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

export interface TwoFactorSignInReqDTO {
  twoFactorToken: string;
  twoFactorCode: string;
}

export interface TwoFactorSignInResDTO {
  token: string;
}
