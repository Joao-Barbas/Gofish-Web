export interface GetEnumeratorResDTO {
  success: boolean;
  data?: {
    enumerator: EnumeratorDTO[]
  };
  errors?: {
    code: string;
    description: string;
  }[];
}

export interface EnumeratorDTO {
  value: number;
  name: string;
}

export interface EnumDTO {
  label: string;
  value: number;
}

export interface GetEnumResDTO {
  success: boolean;
  data?: {
    enumerator: EnumDTO[]
  };
  errors?: {
    code: string;
    description: string;
  }[];
}
