export interface ApiError {
  code: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: ApiError[] | null;
}
