// user.dto.ts

import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";

export interface FriendshipDto {
  requesterUserId: string;
  receiverUserId: string;
  state: FriendshipState;
  createdAt: string;
  repliedAt?: string;
}

export interface GetFriendshipsReqDto {
  // Unused
}

export interface GetFriendshipsResDto {
  friendships: FriendshipDto[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}
