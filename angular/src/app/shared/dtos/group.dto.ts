import { GetPostsPostDTO } from "@gofish/shared/dtos/get-post.dto";
import { GetGroupMemberDTO } from "@gofish/shared/dtos/members.dto";
import { GeoLocationDTO, PinDetailsDTO, PinDto } from "@gofish/shared/dtos/pin.dto";
import { FriendshipState } from "@gofish/shared/enums/friendship-state.enum";
import { GroupRole } from "@gofish/shared/enums/group-role.enum";
import { VisibilityLevel } from "@gofish/shared/enums/visibility-level.enum";
import { VoteKind } from "@gofish/shared/enums/vote-kind.enum";
import { PinKind } from "@gofish/shared/models/pin.model";

export interface GetGroupReqDTO {
  groupId: number;
  dataRequest?: GroupDataRequestDTO;
}

export interface GroupDataRequestDTO {
  includePosts?: boolean;
  includeMembers?: boolean;
}

export interface GetGroupResDTO {
  group: GetGroupDTO;
}

export interface GetGroupDTO {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
  memberCount: number;
  postCount: number;
  posts?: GetPostsPostDTO[]
  members?: GetGroupMemberDTO[]
}

export interface CreateGroupReqDTO {
  image: File | null;
  name: string;
  description: string;
}

export interface CreateGroupResDTO {
  id: number;
}

export interface GetUserGroupsResDTO{
  groups: GetGroupDTO[];
}

// group.dto.ts

// View models

export interface SearchGroupDTO {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  postCount: number;
  memberCount: number;
}

export interface GroupMemberDTO {
  userId: string;
  userName: string;
  displayName: string;
  avatarUrl?: string;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupPostPinDTO {
    kind: PinKind;
    visibility: VisibilityLevel;
    ExpiresAt?: string;
    Details: PinDetailsDTO;
    Geolocation: GeoLocationDTO;
}

export interface GroupPostDTO {
    id: number,
    body?: string,
    imageUrl?: string,
    createdAt: string,
    score: number,
    commentCount: number,
    userVote: VoteKind,
    author: GroupMemberDTO,
    pin: GroupPostPinDTO
    kind?: PinKind;
}

export interface GroupDTO {
  id: number;
  name: string;
  createdAt: string;
  memberCount: number;
  pinCount: number;
  owner: GroupMemberDTO;
  description?: string;
  avatarUrl?: string;
}

// Requests

export interface GetGroupMembersReqDTO {
  groupId: number;
  role?: GroupRole;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetGroupPostsReqDTO {
  groupId: number;
  kind: PinKind;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface SearchGroupsReqDTO {
  query: string;
  maxResults?: number;
  lastGroupName?: string;
}

export interface SendGroupInviteReqDTO {
  groupId: number,
  receiverUserId: string;
}

// Responses

export interface GetGroupMembersResDTO {
  members: GroupMemberDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface GetGroupPostsResDTO {
  posts: GroupPostDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}

export interface SearchGroupsResDTO {
  groups: SearchGroupDTO[];
  hasMoreResults: boolean;
  lastGroupName: string | null;
}

export interface SendGroupInviteResDTO {
  inviteId: number
};

// ================================
// NOVOS DTOS
// ================================

export interface GetGroupPinsReqDto {
  groupId: number;
  kind?: PinKind;
  maxResults?: number;
  lastTimestamp?: string;
}

export interface GetGroupPinsResDto {
  pins: PinDto[];
  hasMoreResults: boolean;
  lastTimeStamp?: string;
}

export interface GroupInviteDTO {
  id: number;
  group: GroupDTO;
  inviteState: FriendshipState;
  createdAt: string;
  requester: GroupMemberDTO;
}
