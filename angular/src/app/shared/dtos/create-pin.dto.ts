// Create CatchPin
export interface CreateCatchPinReqDTO {
  latitude: number;
  longitude: number;
  description: string;
  speciesType: number;
  hookSize: number;
  baitType: number;
}

// Create InfoPin
export interface CreateInfoPinReqDTO {
  latitude: number;
  longitude: number;
  description: string;
  accessDifficulty: number;
  seaBedType: number;
}

// Create WarnPin
export interface CreateWarnPinReqDTO {
  latitude: number;
  longitude: number;
  description: string;
  warnPinType: number;
}

// Basta 1 reponse para todos os pins
export interface CreatePinResDTO {
  success: boolean;
  id?: number;
  errorMessage?: string;
}

