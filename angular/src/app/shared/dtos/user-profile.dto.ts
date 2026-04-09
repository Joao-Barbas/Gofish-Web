// user-profile.dto.ts

import { FriendshipDTO } from "@gofish/shared/dtos/user.dto";
import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";

// View models

export interface UserProfileDTO {
  userId: string;
  displayName: string;
  userName: string;
  catchPoints: number;
  rank: number;
  bio?: string;
  avatarUrl?: string;
  joinedAt: string;
  lastActiveAt: string;
  friendship?: FriendshipDTO;
  weeklyStreak: number;
  maxWeeklySteak: number;
  pinsCount: number;
  friendsCount: number;
  groupsCount: number;
}

// End view models

export interface GetUserProfileReqDTO {
  // Unused
}

/**
 * @deprecated Use {@link UserProfileDTO} instead
 */
export interface GetUserProfileResDTO { // TODO: Remove
  userId: string;
  displayName?: string;
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
