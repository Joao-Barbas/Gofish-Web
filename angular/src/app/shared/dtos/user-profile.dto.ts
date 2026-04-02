// user-profile.dto.ts

import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";

export interface GetUserProfileReqDTO {
  // Unused
}

export interface GetUserProfileResDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  catchPoints: number;
  rank: number;
  bio?: string;
  avatarUrl?: string;
  joinedAt: string;
  lastActiveAt: string;
  friendshipState?: FriendshipState,
  weeklyStreak: number;
  maxWeeklySteak: number;
  pinsCount: number;
  friendsCount: number;
  groupsCount: number;
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
