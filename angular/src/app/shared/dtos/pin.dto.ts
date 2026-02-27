// Create CatchPin
export interface CreateCatchPinReqDTO {
  latitude: number;
  longitude: number;
  visibility: number;
  body?: string;
  image: string;
  speciesType?: number;
  hookSize?: string;
  baitType?: number;
}

// Create InfoPin
export interface CreateInfoPinReqDTO {
  latitude: number;
  longitude: number;
  visibility: number;
  body?: string | null;
  accessDifficulty: number;
  seaBedType: number;
}

// Create WarnPin
export interface CreateWarnPinReqDTO {
  latitude: number;
  longitude: number;
  visibility: number;
  body?: string | null;
  warnPinType: number;
}

// Basta 1 reponse para todos os pins
export interface CreatePinResDTO {
  success: boolean;
  data?: {
    id: number;
  }
  errors?: {
    code: string;
    description: string;
  }[]
}

export type PinPreviewResDTO = {
  success: boolean;
  data?: {
    // Pin
    id: number;
    latitude: number;
    longitude: number;
    createdAt: string;
    pinType: number;

    // User
    authorId: number;
    authorUserName: string;

    // Post
    postBody?: string;
    postImageUrl?: string;

    // Catch Pin
    speciesType?: number;
    baitType?: number;
    hookSize?: number;

    // Info Pin
    accessDifficulty?: number;
    seaBedType?: number;

    // Warn Pin
    warningType?: number;
  }
  errors?: {
    code: string;
    description: string;
  }[]
}


export interface ViewportPinsResDTO {
  pins: ViewportPinDTO[];
}

export interface ViewportPinDTO {
  id: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  visibility: number;
  kind: number;
}


