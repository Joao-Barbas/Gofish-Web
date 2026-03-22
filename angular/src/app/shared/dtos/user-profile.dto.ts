// user-profile.dto.ts

export interface GetUserProfileReqDTO {
  // Unused
}

export interface GetUserProfileResDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  fishingScore: number;
  bio?: string;
  avatarUrl?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface PutUserProfileReqDTO {
  bio: string;
  avatarUrl: string;
}

export interface PatchUserProfileReqDTO {
  bio?: string;
  avatarUrl?: string;
}
