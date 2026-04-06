import { NumbersOnlyDirective } from "@gofish/shared/directives/numbers-only.directive";
import { AccessDifficulty } from "@gofish/shared/enums/access-difficulty.enums";
import { Bait } from "@gofish/shared/enums/bait.enums";
import { FeedKind } from "@gofish/shared/enums/feed-kind.enum";
import { GroupRole } from "@gofish/shared/enums/group-role.enum";
import { Seabed } from "@gofish/shared/enums/seabed.enum";
import { Species } from "@gofish/shared/enums/species.enum";
import { VisibilityLevel } from "@gofish/shared/enums/visibility-level.enum";
import { VoteKind } from "@gofish/shared/enums/vote-kind.enum";
import { WarningKind } from "@gofish/shared/enums/warning-kind.enum";
import { PinKind } from "@gofish/shared/models/pin.model";

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

export interface GetPinsResDTO {
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

// ================================
// NOVOS DTOS
// ================================

export interface PinGeolocationDto {
  latitude: number;
  longitude: number;
}

export interface PinDetailsDto {
  species?: Species;
  bait?: Bait;
  hookSize?: string;

  accessDifficulty?: AccessDifficulty;
  seabed?: Seabed;

  warningKind?: WarningKind;
}

export interface PinAuthorDto {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  catchPoint: number;
  rank: number;
  avatarUrl?: string;
  groupRole?: GroupRole;
}

export interface PinStatsDto {
  currentUserVote?: VoteKind;
  score: number;
  commentCount: number;
}

export interface PinUgcDto {
  body?: string;
  imageUrl?: string;
}

export interface PinDto {
  id: number;
  createdAt: string;
  visibility: VisibilityLevel;
  kind: PinKind;

  geolocation?: PinGeolocationDto;
  author?: PinAuthorDto;
  details?: PinDetailsDto;
  stats?: PinStatsDto;
  ugc?: PinUgcDto;
}

export interface CommentAuthorDto {
  id: string;
  userName: string;
  catchPoint: number;
  rank: number;
  avatarUrl?: string;
}

export interface CommentDto {
  id: number;
  body: string;
  createdAt: string;
  author: CommentAuthorDto;
}


export interface GetPinsIdDto {
  pinId?: number;
  authorId?: string;
  groupId?: number;
}

export interface GetPinsDataRequestDto {
  includeGeolocation?: boolean;
  includeAuthor?: boolean;
  includeDetails?: boolean;
  includeStats?: boolean;
  includeUgc?: boolean;
  includeGroups?: boolean;
}


export interface GetInViewportReqDto {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface GetFeedReqDto {
  kind: FeedKind;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetPinsReqDto {
  ids: GetPinsIdDto[];
  dataRequest?: GetPinsDataRequestDto;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface VoteReqDto {
  value: VoteKind;
}

export interface CreateCommentReqDto {
  pinId: number;
  body: string;
}

export interface CreateCatchPinReqDto {
  latitude: number;
  longitude: number;
  visibility: VisibilityLevel;
  groupIds?: number[];
  body?: string;

  image: File;
  species?: Species;
  bait?: Bait;
  hookSize?: string;
}

export interface CreateInfoPinReqDto {
  latitude: number;
  longitude: number;
  visibility: VisibilityLevel;
  groupIds?: number[];
  body?: string;

  accessDifficulty: AccessDifficulty;
  seabed: Seabed;
}

export interface CreateWarnPinReqDto {
  latitude: number;
  longitude: number;
  visibility: VisibilityLevel;
  groupIds?: number[];
  body?: string;

  warningKind: WarningKind;
}

export interface GetCommentsReqDto {
  pinId: number;
  maxResults?: number;
  lastTimestamp?: string;
}

// =======================
// RESPONSES
// =======================

export interface GetInViewportResDto {
  pins: PinDto[];
}

export interface GetFeedResDto {
  pins: PinDto[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface GetPinsResDto {
  pins: PinDto[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface VoteResDto {
  userVote?: VoteKind;
  newScore: number;
}

export interface CreateCommentResDto {
  id: number;
}

export interface CreatePinResDto {
  id: number;
}

export interface GetCommentsResDto {
  comments: CommentDto[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}
