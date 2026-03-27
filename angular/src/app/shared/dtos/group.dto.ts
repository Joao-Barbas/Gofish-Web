import { GetPostsPostDTO } from "@gofish/shared/dtos/get-post.dto";
import { GetGroupMemberDTO } from "@gofish/shared/dtos/members.dto";
import { GroupRole } from "@gofish/shared/enums/group-role.enum";

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

export interface GroupMemberDTO {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: GroupRole;
  joinedAt: string;
}

export interface GetGroupMembersReqDTO {
  groupId: number;
  role?: GroupRole;
  maxResults: number;
  lastTimestamp: string;
}

export interface GetGroupMembersResDTO {
  members: GroupMemberDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}
