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

export interface GetUserProfileSettingsReqDTO {
  // Unused
}

export interface GetUserProfileSettingsResDTO {
  bio?: string,
  avatarUrl?: string
}

export interface PutUserProfileReqDTO {
  bio: string;
  avatar: File;
}

export interface PatchUserProfileReqDTO {
  bio?: string;
  avatar?: File;
}
