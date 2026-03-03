export interface SignInReqDTO {
  emailOrUserName: string;
  password: string;
}

export interface SignInResDTO {
  token?: string;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}
