import { PostDataRequestDTO, GetPostsPostDTO } from './get-post.dto';

export interface GetFeedReqDTO {
  kind: number;
  dataRequest?: PostDataRequestDTO;
  lastTimestamp: string;
  maxResults: number;
}

export interface GetFeedResDTO {
  posts: GetPostsPostDTO[];
  hasMoreResults: boolean;
  lastTimestamp?: string;
}
