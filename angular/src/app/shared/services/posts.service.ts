import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { GetFeedReqDTO, GetFeedResDTO } from '@gofish/shared/dtos/get-feed.dto';
import { CreatePostCommentReqDTO, CreatePostCommentResDTO, GetPostsReqDTO, GetPostsResDTO } from '@gofish/shared/dtos/get-post.dto';
import { VotePostDTO } from '@gofish/shared/dtos/vote-post.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly http = inject(HttpClient);

  getPosts(dto: GetPostsReqDTO): Observable<GetPostsResDTO> {
    return this.http.post<GetPostsResDTO>(Api.Post.action('GetPosts'), dto);
  }

  getFeed(dto: GetFeedReqDTO): Observable<GetFeedResDTO> {
    return this.http.post<GetFeedResDTO>(Api.Post.action('GetFeed'), dto);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(Api.Post.action(`DeletePost/${id}`));
  }

  postVote(postId: number, dto: VotePostDTO): Observable<void> {
    return this.http.post<void>(Api.Post.action(`PostVote/${postId}`), dto);
  }

  createComment(dto: CreatePostCommentReqDTO): Observable<CreatePostCommentResDTO> {
    return this.http.post<CreatePostCommentResDTO>(Api.Post.action("CreateComment"), dto);
  }

}
