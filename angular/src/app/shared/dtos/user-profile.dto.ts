// user-profile.dto.ts

export interface GetUserProfileReqDto {
  // Unused
}

export interface GetUserProfileResDto {
  userId: string;
  fishingScore: number;
  bio?: string;
  avatarUrl?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface PutUserProfileReqDto {
  bio: string;
  avatarUrl: string;
}

export interface PatchUserProfileReqDto {
  bio?: string;
  avatarUrl?: string;
}
