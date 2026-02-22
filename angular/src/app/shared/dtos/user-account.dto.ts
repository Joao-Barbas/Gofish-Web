export interface DeleteAccountReqDTO {
  password: string; // TODO: Also 2FA code if enabled
}

export interface DeleteAccountResDTO {
  success?: boolean;
  errors?: {
    code: string;
    description: string;
  }[]
}
