import { Component, inject } from '@angular/core';
import { GroupSettingsPopoverComponent } from "../groups/components/group-settings-popover/group-settings-popover.component";
import { PostsService } from '@gofish/shared/services/posts.service';
import { GetPostsPostDTO, GetPostsReqDTO, GetPostsResDTO, PostIdDTO } from '@gofish/shared/dtos/get-post.dto';
import { ActivatedRoute } from '@angular/router';
import { ForumPostComponent } from '@gofish/features/forum/components/forum-post/forum-post.component';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-post-id-placeholder',
  imports: [GroupSettingsPopoverComponent, ForumPostComponent],
  templateUrl: './post-id-placeholder.component.html',
  styleUrl: './post-id-placeholder.component.css',
})
export class PostIdPlaceholderComponent {
  private readonly postService = inject(PostsService)
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  userName = this.authService.getUserName();
  isAdmin = this.authService.isAdmin();
  post: GetPostsPostDTO | null = null;
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert("Null id");
      return;
    };


    const dto: GetPostsReqDTO = {
      ids: [{postId: Number(id)}],
      dataRequest: {
        includeAuthor: true,
        includeComments: true,
        includeGroups: true,
        includeCoords: true
      },
      lastTimestamp: new Date().toISOString(),
      maxResults: 1,
    }

    this.postService.getPosts(dto).subscribe({
      next: (res) => {
        this.post = res.posts[0];
      },
      error: (err) => {
        console.log(err);
      }
    });

    console.log(this.post);
  }
}
