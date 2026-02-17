export interface SignInReqDTO {
  emailOrUserName: string;
  password: string;
}

export interface SignInResDTO {
  success: boolean;
  data?: {
    token?: string;
    requiresTwoFactor?: boolean;
    twoFactorToken?: string;
  };
  errors?: {
    code: string;
    description: string;
  }[];
}
