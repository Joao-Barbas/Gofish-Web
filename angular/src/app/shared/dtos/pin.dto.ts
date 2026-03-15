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
  body?: string;
  warningKind: number;
}

// Basta 1 reponse para todos os pins
 export interface CreatePinResDTO {
    id: number;
}
/*
export type PinPreviewResDTO = {
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
} */

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

export interface GetPinsReqDTO {
  ids: PinIdDTO[] ,
  dataRequest: PinDataReqDTO
}

export interface GetPinsResDTO{
  pins: PinDataResDTO[]
}

export interface PinDataReqDTO {
  includeGeolocation?: boolean | null;
  includeAuthor?: boolean | null;
  includePost?: boolean | null;
  includeDetails?: boolean | null;
  includeGroups?: boolean | null;
}

export interface PinDataResDTO {
  id: number;
  createdAt: string;
  visibility: number;
  kind: number;
  details?: PinDetailsDTO | null;
  geolocation?: GeoLocationDTO | null;
  author?: AuthorDTO | null;
  post?: PostDTO | null;
}
export interface PinIdDTO {
  pinId?: number,
  authorId?: string,
  groupId?: number
}
export interface PinDetailsDTO {
  species: number;
  bait: number;
  hookSize: string;
  accessDificulty: number;
  seabed: number;
  warningKind: number;
}

export interface GeoLocationDTO {
  latitude: number;
  longitude: number;
}

export interface AuthorDTO {
  id: string;
  userName: string;
}

export interface PostDTO {
  body?: string | null;
  imageUrl?: string | null;
  score?: number;
  commentCount?: number | null;
}
