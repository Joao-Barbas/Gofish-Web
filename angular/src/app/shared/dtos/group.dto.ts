import { GetPostsPostDTO } from "@gofish/shared/dtos/get-post.dto";
import { GetGroupMemberDTO } from "@gofish/shared/dtos/members.dto";
import { GeoLocationDTO, PinDetailsDTO } from "@gofish/shared/dtos/pin.dto";
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

export interface GroupMemberDTO {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
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
