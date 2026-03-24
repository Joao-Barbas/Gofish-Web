import { Component, inject, signal } from '@angular/core';
import { ForumPostComponent } from "../../components/forum-post/forum-post.component";
import { Router } from '@angular/router';
import { GetPostsResDTO, GetPostsReqDTO } from '@gofish/shared/dtos/get-post.dto';
import { PostsService } from '@gofish/shared/services/posts.service';
import { GetFeedReqDTO, GetFeedResDTO } from '@gofish/shared/dtos/get-feed.dto';

@Component({
  selector: 'app-discover',
  imports: [ForumPostComponent],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css',
})
export class DiscoverComponent {
  private readonly router = inject(Router);
  private readonly postService = inject(PostsService);
  allFeedPosts = signal<GetFeedResDTO | null>(null);
  hasMoreResults = signal(true);
  private lastTimestamp: string = new Date().toISOString();

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    const request: GetFeedReqDTO = {
      kind: 0,
      dataRequest: {
        includeAuthor: true,
        includeGroups: true,
        includeComments: true,
        includeCoords: true,
      },
      lastTimestamp: this.lastTimestamp,
      maxResults: 5
    }
    this.postService.getFeed(request).subscribe({
      next: (res) => {
        this.allFeedPosts.update(current => {
          if (!current) return res;
          // Verify if backend is not sending same posts
          const newPosts = res.posts.filter(newPost => !current.posts.some(currentPost => currentPost.id === newPost.id));

          if (newPosts.length === 0) {
            this.hasMoreResults.set(false);
          }
          return {
            ...res,
            posts: [...current!.posts, ...newPosts]
          };
        });

        if (res.posts.length > 0) {
          const lastPost = res.posts[res.posts.length - 1];
          this.lastTimestamp = lastPost.createdAt;
        } else {
          this.hasMoreResults.set(false);
        }
        console.log('Foram carregados mais');
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  showMore() {
    this.loadPosts();
  }
}
