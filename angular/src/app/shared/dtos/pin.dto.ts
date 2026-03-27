import { NumbersOnlyDirective } from "@gofish/shared/directives/numbers-only.directive";

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
  groupIds?: number[];
}

// Create InfoPin
export interface CreateInfoPinReqDTO {
  latitude: number;
  longitude: number;
  visibility: number;
  body?: string;
  accessDifficulty: number;
  seaBedType: number;
  groupIds?: number[];
}

// Create WarnPin
export interface CreateWarnPinReqDTO {
  latitude: number;
  longitude: number;
  visibility: number;
  body?: string;
  warningKind: number;
  groupIds?: number[];
}

// Basta 1 reponse para todos os pins
 export interface CreatePinResDTO {
    id: number;
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

export interface GetPinsReqDTO {
  ids: PinIdDTO[];
  dataRequest: PinDataReqDTO;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetPinsResDTO{
  pins: PinDataResDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface PinDataReqDTO {
  includeGeolocation?: boolean;
  includeAuthor?: boolean;
  includePost?: boolean;
  includeDetails?: boolean;
  includeGroups?: boolean;
}

export interface PinDataResDTO {
  id: number;
  createdAt: string;
  visibility: number;
  kind: number;
  details?: PinDetailsDTO;
  geolocation?: GeoLocationDTO;
  author?: AuthorDTO;
  post?: PostDTO;
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
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface PostDTO {
  id?: number,
  body?: string;
  imageUrl?: string;
  score?: number;
  commentCount?: number;
  userVote?: number;
}
