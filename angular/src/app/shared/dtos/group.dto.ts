import { GetPostsPostDTO } from "@gofish/shared/dtos/get-post.dto";
import { GetGroupMemberDTO } from "@gofish/shared/dtos/members.dto";

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
