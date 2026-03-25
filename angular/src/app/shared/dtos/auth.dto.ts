// auth.dto.ts

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

export interface ExternalSignInReqDTO {
  // Unused
}

export interface ExternalSignInResDTO {
  token: string;
}

export interface SignUpReqDTO {
  email: string;
  password: string;
  userName: string;
  firstName: string;
  lastName: string;
}

export interface SignUpResDTO {
  token: string;
}
