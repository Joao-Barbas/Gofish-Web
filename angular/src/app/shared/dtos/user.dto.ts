// user.dto.ts

import { GroupInviteDTO } from "@gofish/shared/dtos/group.dto";
import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";
import { Gender } from "@gofish/shared/enums/gender.enum";
import { GroupRole } from "@gofish/shared/enums/group-role.enum";

export interface LeaderboardUserDTO {
  position: number;
  userId: string;
  userName: string;
  displayName: string;
  catchPoints: number;
  catchPointsDelta: number;
  weeklyStreak: number;
  rank: number;
  avatarUrl?: string;
}

export interface LeaderboardResDTO {
  entries: LeaderboardUserDTO[];
  currentUser?: LeaderboardUserDTO;
}

export interface SearchUserDTO {
  id: string;
  userName: string;
  displayName: string;
  catchPoints: number;
  rank: number;
  avatarUrl?: string;
}

export interface SearchUsersReqDTO {
  query: string;
  maxResults?: number;
  lastUsername?: string;
}

export interface SearchUsersResDTO {
  users: SearchUserDTO[];
  hasMoreResults: boolean;
  lastUsername: string | null;
}

export interface GetUserReqDTO {
  // Unused
}

export interface GetUserResDTO {
  userName: string;
  displayName: string;
  friendshipState?: FriendshipState;
}

export interface GetUserSettingsReqDTO {
  // Unused
}

export interface GetUserSettingsResDTO {
  userName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  birthDate?: string;
  gender?: Gender;
}

export interface PutUserReqDTO {
  userName: string,
  displayName: string,
  phoneNumber: string,
  firstName: string,
  lastName: string,
  email: string,
  birthDate?: string,
  gender?: Gender
}

export interface PutUserResDTO {
  // Unused
}

export interface PatchUserReqDTO {
  userName?: string,
  displayName?: string,
  phoneNumber?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  birthDate?: string,
  gender?: Gender
}

export interface PatchUserResDTO {
  // Unused
}

export interface FriendshipUserDTO {
  userId: string;
  userName: string;
  displayName: string;
  avatarUrl?: string;
  catchPoints?: number,
  rank?: number
}

export interface FriendshipDTO {
  id: number;
  requesterUserId: string;
  receiverUserId: string;
  state: FriendshipState;
  createdAt: string;
  repliedAt?: string;
  requester: FriendshipUserDTO;
  receiver: FriendshipUserDTO;
}

export interface GetFriendshipsReqDTO {
  // Unused
}

export interface GetFriendshipsResDTO {
  friendships: FriendshipDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface GetFriendshipBetweenReqDTO {
  userId1: string;
  userId2: string;
}

export interface RequestFriendshipReqDTO {
  receiverId: string;
}

export interface RequestFriendshipResDTO {
  // Unused
}

// Groups

export interface UserGroupDTO {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdAt: string;
  role: GroupRole;
  memberCount: number;
  pinCount: number;
}

export interface GetUserGroupReqDTO {
  userId?: string;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetUserGroupResDTO {
  groups: UserGroupDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string
}

export interface GetInvitableGroupsReqDTO {
  targetUserId: string;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetInvitableGroupsResDTO {
  groups: UserGroupDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface GetGroupInvitesReqDTO {
  state?: FriendshipState;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetGroupInvitesResDTO {
  invites: GroupInviteDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}
