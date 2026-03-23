// user.dto.ts

import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";

export interface GetUserReqDTO {
  // Unused
}

export interface GetUserResDTO {
  userName: string;
  firstName: string;
  lastName: string;
}

export interface FriendshipUserDTO {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
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

export interface RequestFriendshipReqDTO {
  receiverId: string;
}

export interface RequestFriendshipResDTO {
  id: number;
}
