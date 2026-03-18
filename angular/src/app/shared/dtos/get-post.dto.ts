import { PinKind } from "@gofish/shared/models/pin.model";

// ---------- Request ----------

export interface PostIdDTO {
  postId?: number;
  authorId?: string;
  groupId?: number;
}

export interface PostDataRequestDTO {
  includeAuthor?: boolean;
  includeGroups?: boolean;
  includeComments?: boolean;
}

export interface GetPostsReqDTO {
  ids?: PostIdDTO[];
  dataRequest?: PostDataRequestDTO;
  lastTimestamp: string;   // DateTime → string (ISO 8601)
  maxResults: number;
}

// ---------- Response ----------

export interface GetPostsAuthorDTO {
  id: string;
  userName: string;
}

export interface GetPostsGroupDTO {
  id: number;
  name: string;
}

export interface GetPostsCommentDTO {
  id: number;
  body: string;
  createdAt: string;       // DateTime → string
  userId: string;
  userName: string;
}

export interface GetPostsPostDTO {
  id: number;
  createdAt: string;       // DateTime → string
  body?: string;
  imageUrl?: string;
  score: number;
  commentCount: number;
  kind: PinKind;
  warningKind?: number;
  author?: GetPostsAuthorDTO;
  comments?: GetPostsCommentDTO[];
  groups?: GetPostsGroupDTO[];
}

export interface GetPostsResDTO {
  posts: GetPostsPostDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;  // DateTime? → string | undefined
}
