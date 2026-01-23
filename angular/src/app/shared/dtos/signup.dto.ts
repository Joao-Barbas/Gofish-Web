export interface SignUpReqDTO {
  email: string,
  password: string,
  userName: string,
  firstName: string,
  lastName: string
}

export interface SignUpResDTO {
  success: boolean;
  errors?: {
    code: string;
    description: string;
  }[]
}
