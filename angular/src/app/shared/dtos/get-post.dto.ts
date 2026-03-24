import { NgModel } from "@angular/forms";
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
  includeCoords?: boolean;
}

export interface GetPostsReqDTO {
  ids?: PostIdDTO[];
  dataRequest?: PostDataRequestDTO;
  lastTimestamp: string;
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
  createdAt: string;
  userId: string;
  userName: string;
}

export interface GetPostsPostDTO {
  id: number;
  createdAt: string;
  body?: string;                  // post-description
  imageUrl?: string;
  score: number;
  commentCount: number;
  kind: number;
  userVote?: number;
  // Warning
  warningKind?: number;
  // Info
  accessDifficulty?: number;
  seabed?: number;
  // Catch
  species?: number;
  bait?: number;
  hookSize?: string;

  author?: GetPostsAuthorDTO;
  comments?: GetPostsCommentDTO[];
  groups?: GetPostsGroupDTO[];
  coords?: GetPostsCoordsDTO;
}

export interface GetPostsResDTO {
  posts: GetPostsPostDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;  // DateTime? → string | undefined
}

export interface GetPostsCoordsDTO {
  latitude: number,
  longitude: number
}


export interface CreatePostCommentReqDTO {
  id: number;
  body: string;
}

export interface CreatePostCommentResDTO {
  id: number;
}
