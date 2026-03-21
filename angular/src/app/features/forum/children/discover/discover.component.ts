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

  ngOnInit() {
    const request: GetFeedReqDTO = {
      kind: 0,
      dataRequest: {
        includeAuthor: true,
        includeGroups: true,
        includeComments: true,
        includeCoords: true,
      },
      lastTimestamp: new Date().toISOString(),
      maxResults: 5
    }
    this.postService.getFeed(request).subscribe({
      next: (res) => {
        this.allFeedPosts.set(res);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}
