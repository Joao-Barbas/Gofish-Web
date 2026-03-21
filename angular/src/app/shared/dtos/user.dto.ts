// user.dto.ts

import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";

export interface FriendshipUserDTO {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface FriendshipDTO {
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
